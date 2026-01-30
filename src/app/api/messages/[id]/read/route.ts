import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { USER_ID } from "@/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isRead } = body;

    const message = await prisma.message.findFirst({
      where: {
        id,
        userId: USER_ID,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error("Failed to update message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
