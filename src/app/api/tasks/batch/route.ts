import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tasks: tasksToCreate } = body;

    if (!Array.isArray(tasksToCreate) || tasksToCreate.length === 0) {
      return NextResponse.json(
        { error: "Tasks array is required" },
        { status: 400 }
      );
    }

    // Get the current max position for 'todo' status
    const maxPositionTask = await prisma.task.findFirst({
      where: {
        userId: session.user.id,
        status: "todo",
      },
      orderBy: { position: "desc" },
    });

    let currentPosition = (maxPositionTask?.position ?? -1) + 1;

    const createdTasks = await prisma.$transaction(
      tasksToCreate.map((task: {
        title: string;
        description?: string;
        priority?: string;
        dueDate?: string;
        sourceMessageId?: string;
        aiGenerated?: boolean;
      }) => {
        const position = currentPosition++;
        return prisma.task.create({
          data: {
            userId: session.user.id,
            title: task.title,
            description: task.description,
            status: "todo",
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            sourceMessageId: task.sourceMessageId,
            aiGenerated: task.aiGenerated || false,
            position,
          },
        });
      })
    );

    return NextResponse.json({ tasks: createdTasks }, { status: 201 });
  } catch (error) {
    console.error("Failed to create tasks:", error);
    return NextResponse.json(
      { error: "Failed to create tasks" },
      { status: 500 }
    );
  }
}
