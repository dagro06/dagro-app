import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { IntegrationProvider } from "@/types";
import { USER_ID } from "@/lib/constants";

const allProviders: IntegrationProvider[] = [
  "clickup",
  "slack",
  "outlook",
  "notion",
  "gdrive",
];

export async function GET() {
  try {
    const userIntegrations = await prisma.integration.findMany({
      where: {
        userId: USER_ID,
        isActive: true,
      },
    });

    const integrations = allProviders.map((provider) => {
      const integration = userIntegrations.find((i) => i.provider === provider);

      if (integration) {
        const metadata = integration.metadata as Record<string, unknown> | null;
        return {
          provider,
          isConnected: true,
          accountName: metadata?.accountName as string | undefined,
          lastSync: integration.updatedAt,
        };
      }

      return {
        provider,
        isConnected: false,
      };
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Failed to fetch integration statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch integration statuses" },
      { status: 500 }
    );
  }
}
