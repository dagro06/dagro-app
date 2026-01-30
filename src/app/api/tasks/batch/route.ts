import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { USER_ID } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks: tasksToCreate } = body;

    if (!Array.isArray(tasksToCreate) || tasksToCreate.length === 0) {
      return NextResponse.json(
        { error: "Tasks array is required" },
        { status: 400 }
      );
    }

    const maxPositionTask = await prisma.task.findFirst({
      where: {
        userId: USER_ID,
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
            userId: USER_ID,
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
