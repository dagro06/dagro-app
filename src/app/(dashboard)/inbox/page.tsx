"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { MessageList } from "@/components/inbox/message-list";
import { SourceFilter } from "@/components/inbox/source-filter";
import { MessageDetail } from "@/components/inbox/message-detail";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { UnifiedMessage } from "@/types";

export default function InboxPage() {
  const {
    messages,
    messagesLoading,
    setMessages,
    setMessagesLoading,
    searchQuery,
    setSearchQuery,
    messageFilter,
  } = useAppStore();

  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const filteredMessages = messages
    .filter((m) => !m.isArchived)
    .filter((m) => messageFilter === "all" || m.source === messageFilter)
    .filter(
      (m) =>
        !searchQuery ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-6">
      {/* Message list */}
      <div className="flex-1 flex flex-col bg-white rounded-lg border">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Inbox</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMessages}
              disabled={messagesLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${messagesLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SourceFilter />
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-auto">
          <MessageList
            messages={filteredMessages}
            loading={messagesLoading}
            onSelectMessage={setSelectedMessage}
            selectedMessageId={selectedMessage?.id}
          />
        </div>
      </div>

      {/* Message detail */}
      {selectedMessage && (
        <div className="w-[500px] bg-white rounded-lg border">
          <MessageDetail
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
          />
        </div>
      )}
    </div>
  );
}
