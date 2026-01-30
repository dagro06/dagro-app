import { NextRequest, NextResponse } from "next/server";
import { extractTasksFromMessage } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, sender, subject } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const result = await extractTasksFromMessage(content, sender, subject);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to extract tasks:", error);
    return NextResponse.json(
      { error: "Failed to extract tasks" },
      { status: 500 }
    );
  }
}
