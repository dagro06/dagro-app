"use client";

import { useAppStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSource } from "@/types";

const sources: Array<{ value: MessageSource | "all"; label: string }> = [
  { value: "all", label: "All Sources" },
  { value: "slack", label: "Slack" },
  { value: "outlook", label: "Outlook" },
  { value: "notion", label: "Notion" },
];

export function SourceFilter() {
  const { messageFilter, setMessageFilter } = useAppStore();

  return (
    <Select
      value={messageFilter}
      onValueChange={(value) => setMessageFilter(value as MessageSource | "all")}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Filter by source" />
      </SelectTrigger>
      <SelectContent>
        {sources.map((source) => (
          <SelectItem key={source.value} value={source.value}>
            {source.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
