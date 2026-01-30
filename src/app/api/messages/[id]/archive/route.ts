import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const message = await prisma.message.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error("Failed to archive message:", error);
    return NextResponse.json(
      { error: "Failed to archive message" },
      { status: 500 }
    );
  }
}
