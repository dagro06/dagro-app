import { NextRequest, NextResponse } from "next/server";
import { getClickUpAuthUrl } from "@/lib/integrations/clickup";
import { getSlackAuthUrl } from "@/lib/integrations/slack";
import { getOutlookAuthUrl } from "@/lib/integrations/outlook";
import { getNotionAuthUrl } from "@/lib/integrations/notion";
import { getGoogleAuthUrl } from "@/lib/integrations/gdrive";
import { IntegrationProvider } from "@/types";
import { USER_ID } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/integrations/${provider}/callback`;
    const state = Buffer.from(
      JSON.stringify({ userId: USER_ID })
    ).toString("base64");

    let url: string;

    switch (provider as IntegrationProvider) {
      case "clickup":
        url = getClickUpAuthUrl(redirectUri, state);
        break;
      case "slack":
        url = getSlackAuthUrl(redirectUri, state);
        break;
      case "outlook":
        url = getOutlookAuthUrl(redirectUri, state);
        break;
      case "notion":
        url = getNotionAuthUrl(redirectUri, state);
        break;
      case "gdrive":
        url = getGoogleAuthUrl(redirectUri, state);
        break;
      default:
        return NextResponse.json(
          { error: "Unknown provider" },
          { status: 400 }
        );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to generate auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate auth URL" },
      { status: 500 }
    );
  }
}
