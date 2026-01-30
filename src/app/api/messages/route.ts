import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get("source");
    const isRead = searchParams.get("isRead");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {
      userId: session.user.id,
      isArchived: false,
    };

    if (source) {
      where.source = source;
    }

    if (isRead !== null) {
      where.isRead = isRead === "true";
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        integration: {
          select: {
            provider: true,
            metadata: true,
          },
        },
      },
    });

    const total = await prisma.message.count({ where });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        source: m.source,
        sourceId: m.sourceId,
        content: m.content,
        sender: m.sender,
        senderEmail: m.senderEmail,
        senderAvatar: m.senderAvatar,
        subject: m.subject,
        receivedAt: m.receivedAt,
        isRead: m.isRead,
        isArchived: m.isArchived,
        metadata: m.metadata,
      })),
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
