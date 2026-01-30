"use client";

import { UnifiedMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, getSourceColor, truncate } from "@/lib/utils";
import { MessageSquare, Mail, FileText } from "lucide-react";

interface MessageCardProps {
  message: UnifiedMessage;
  onClick: () => void;
  isSelected: boolean;
}

const sourceIcons = {
  slack: MessageSquare,
  outlook: Mail,
  notion: FileText,
};

export function MessageCard({ message, onClick, isSelected }: MessageCardProps) {
  const SourceIcon = sourceIcons[message.source] || MessageSquare;
  const initials = message.sender
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "p-4 cursor-pointer transition-colors hover:bg-gray-50",
        isSelected && "bg-blue-50 hover:bg-blue-50",
        !message.isRead && "bg-blue-50/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-medium truncate",
                  !message.isRead && "font-semibold"
                )}
              >
                {message.sender}
              </span>
              <Badge
                variant="secondary"
                className={cn("text-white text-xs", getSourceColor(message.source))}
              >
                <SourceIcon className="w-3 h-3 mr-1" />
                {message.source}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(message.receivedAt)}
            </span>
          </div>
          {message.subject && (
            <p
              className={cn(
                "text-sm truncate mb-1",
                !message.isRead && "font-medium"
              )}
            >
              {message.subject}
            </p>
          )}
          <p className="text-sm text-muted-foreground truncate">
            {truncate(message.content.replace(/<[^>]*>/g, ""), 100)}
          </p>
        </div>
        {!message.isRead && (
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
        )}
      </div>
    </div>
  );
}
