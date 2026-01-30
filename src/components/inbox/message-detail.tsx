"use client";

import { useState } from "react";
import { UnifiedMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate, getSourceColor } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import {
  X,
  Archive,
  CheckCircle,
  Sparkles,
  Loader2,
  MessageSquare,
  Mail,
  FileText,
} from "lucide-react";
import { ExtractTasksDialog } from "./extract-tasks-dialog";

interface MessageDetailProps {
  message: UnifiedMessage;
  onClose: () => void;
}

const sourceIcons = {
  slack: MessageSquare,
  outlook: Mail,
  notion: FileText,
};

export function MessageDetail({ message, onClose }: MessageDetailProps) {
  const [showExtractDialog, setShowExtractDialog] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const { updateMessage, archiveMessages } = useAppStore();
  const { toast } = useToast();

  const SourceIcon = sourceIcons[message.source] || MessageSquare;
  const initials = message.sender
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleMarkRead = async () => {
    setMarkingRead(true);
    try {
      const response = await fetch(`/api/messages/${message.id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !message.isRead }),
      });

      if (response.ok) {
        updateMessage(message.id, { isRead: !message.isRead });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    } finally {
      setMarkingRead(false);
    }
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/messages/${message.id}/archive`, {
        method: "PATCH",
      });

      if (response.ok) {
        archiveMessages([message.id]);
        onClose();
        toast({
          title: "Message archived",
          description: "The message has been archived.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to archive message",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("text-white", getSourceColor(message.source))}
            >
              <SourceIcon className="w-3 h-3 mr-1" />
              {message.source}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(message.receivedAt)}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={message.senderAvatar} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{message.sender}</p>
              {message.senderEmail && (
                <p className="text-sm text-muted-foreground">
                  {message.senderEmail}
                </p>
              )}
            </div>
          </div>

          {message.subject && (
            <h2 className="text-lg font-semibold mb-4">{message.subject}</h2>
          )}

          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        </div>

        {/* Actions */}
        <Separator />
        <div className="p-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkRead}
            disabled={markingRead}
          >
            {markingRead ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {message.isRead ? "Mark Unread" : "Mark Read"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleArchive}>
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowExtractDialog(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Extract Tasks
          </Button>
        </div>
      </div>

      <ExtractTasksDialog
        open={showExtractDialog}
        onOpenChange={setShowExtractDialog}
        message={message}
      />
    </>
  );
}
