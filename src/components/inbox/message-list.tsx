"use client";

import { UnifiedMessage } from "@/types";
import { MessageCard } from "./message-card";
import { Inbox } from "lucide-react";

interface MessageListProps {
  messages: UnifiedMessage[];
  loading: boolean;
  onSelectMessage: (message: UnifiedMessage) => void;
  selectedMessageId?: string;
}

export function MessageList({
  messages,
  loading,
  onSelectMessage,
  selectedMessageId,
}: MessageListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Inbox className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">No messages</p>
        <p className="text-sm">Connect your accounts to see messages here</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onClick={() => onSelectMessage(message)}
          isSelected={message.id === selectedMessageId}
        />
      ))}
    </div>
  );
}
