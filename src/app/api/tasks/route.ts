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
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
      include: {
        sourceMessage: {
          select: {
            id: true,
            source: true,
            subject: true,
            sender: true,
          },
        },
      },
    });

    return NextResponse.json({
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        sourceMessageId: t.sourceMessageId,
        sourceMessage: t.sourceMessage,
        aiGenerated: t.aiGenerated,
        position: t.position,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, sourceMessageId, aiGenerated } =
      body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get the max position for the status
    const maxPositionTask = await prisma.task.findFirst({
      where: {
        userId: session.user.id,
        status: status || "todo",
      },
      orderBy: { position: "desc" },
    });

    const position = (maxPositionTask?.position ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title,
        description,
        status: status || "todo",
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        sourceMessageId,
        aiGenerated: aiGenerated || false,
        position,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
