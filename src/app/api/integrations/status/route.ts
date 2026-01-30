import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IntegrationProvider } from "@/types";

const allProviders: IntegrationProvider[] = [
  "clickup",
  "slack",
  "outlook",
  "notion",
  "gdrive",
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userIntegrations = await prisma.integration.findMany({
      where: {
        userId: session.user.id,
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
