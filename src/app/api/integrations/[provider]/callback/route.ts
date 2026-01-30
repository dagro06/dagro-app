import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exchangeClickUpCode, getClickUpUser } from "@/lib/integrations/clickup";
import { exchangeSlackCode } from "@/lib/integrations/slack";
import { exchangeOutlookCode, getOutlookUser } from "@/lib/integrations/outlook";
import { exchangeNotionCode } from "@/lib/integrations/notion";
import { exchangeGoogleCode, getGoogleUser } from "@/lib/integrations/gdrive";
import { IntegrationProvider } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?error=missing_params", request.url)
      );
    }

    let stateData: { userId: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/settings?error=invalid_state", request.url)
      );
    }

    const { userId } = stateData;
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/integrations/${provider}/callback`;

    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresAt: Date | undefined;
    let providerAccountId: string;
    let accountName: string | undefined;

    switch (provider as IntegrationProvider) {
      case "clickup": {
        const tokens = await exchangeClickUpCode(code, redirectUri);
        accessToken = tokens.access_token;
        const user = await getClickUpUser(accessToken);
        providerAccountId = String(user.id);
        accountName = user.username;
        break;
      }
      case "slack": {
        const tokens = await exchangeSlackCode(code, redirectUri);
        accessToken = tokens.authed_user.access_token;
        providerAccountId = tokens.authed_user.id;
        accountName = tokens.team.name;
        break;
      }
      case "outlook": {
        const tokens = await exchangeOutlookCode(code, redirectUri);
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token;
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        const user = await getOutlookUser(accessToken);
        providerAccountId = user.id;
        accountName = user.mail || user.userPrincipalName;
        break;
      }
      case "notion": {
        const tokens = await exchangeNotionCode(code, redirectUri);
        accessToken = tokens.access_token;
        providerAccountId = tokens.bot_id;
        accountName = tokens.workspace_name;
        break;
      }
      case "gdrive": {
        const tokens = await exchangeGoogleCode(code, redirectUri);
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token;
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        const user = await getGoogleUser(accessToken);
        providerAccountId = user.id;
        accountName = user.email;
        break;
      }
      default:
        return NextResponse.redirect(
          new URL("/settings?error=unknown_provider", request.url)
        );
    }

    // Upsert the integration
    await prisma.integration.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId,
          provider,
          providerAccountId,
        },
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt,
        isActive: true,
        metadata: { accountName },
      },
      create: {
        userId,
        provider,
        providerAccountId,
        accessToken,
        refreshToken,
        expiresAt,
        metadata: { accountName },
      },
    });

    return NextResponse.redirect(
      new URL(`/settings?success=${provider}`, request.url)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=oauth_failed", request.url)
    );
  }
}
