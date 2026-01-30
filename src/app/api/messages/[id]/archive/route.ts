import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { USER_ID } from "@/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
