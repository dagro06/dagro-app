"use client";

import { useState } from "react";
import { UnifiedMessage, AITaskSuggestion } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { getPriorityColor } from "@/lib/utils";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

interface ExtractTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: UnifiedMessage;
}

export function ExtractTasksDialog({
  open,
  onOpenChange,
  message,
}: ExtractTasksDialogProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const { addTask } = useAppStore();
  const { toast } = useToast();

  const handleExtract = async () => {
    setLoading(true);
    setError("");
    setSuggestions([]);
    setSelectedTasks(new Set());

    try {
      const response = await fetch("/api/ai/extract-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message.content,
          sender: message.sender,
          subject: message.subject,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract tasks");
      }

      const data = await response.json();
      setSuggestions(data.tasks);
      setSummary(data.summary || "");

      // Pre-select high confidence tasks
      const highConfidence = new Set<number>();
      data.tasks.forEach((task: AITaskSuggestion, idx: number) => {
        if (task.confidence >= 0.7) {
          highConfidence.add(idx);
        }
      });
      setSelectedTasks(highConfidence);
    } catch {
      setError("Failed to extract tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTasks = async () => {
    if (selectedTasks.size === 0) return;

    setCreating(true);
    try {
      const tasksToCreate = Array.from(selectedTasks).map((idx) => ({
        ...suggestions[idx],
        sourceMessageId: message.id,
        aiGenerated: true,
      }));

      const response = await fetch("/api/tasks/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasksToCreate }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tasks");
      }

      const data = await response.json();
      data.tasks.forEach((task: Parameters<typeof addTask>[0]) => addTask(task));

      toast({
        title: "Tasks created",
        description: `${selectedTasks.size} task(s) have been created.`,
      });

      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleTask = (idx: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedTasks(newSelected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Extract Tasks with AI
          </DialogTitle>
          <DialogDescription>
            Let AI analyze this message and suggest actionable tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {suggestions.length === 0 && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Click the button below to analyze this message and extract
                potential tasks.
              </p>
              <Button onClick={handleExtract}>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Message
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing message...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-4">
              {summary && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Summary</p>
                  <p className="text-muted-foreground">{summary}</p>
                </div>
              )}

              <div className="space-y-3">
                {suggestions.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleTask(idx)}
                  >
                    <Checkbox
                      checked={selectedTasks.has(idx)}
                      onCheckedChange={() => toggleTask(idx)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{task.title}</p>
                        {task.priority && (
                          <Badge
                            variant="outline"
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {task.dueDate && <span>Due: {task.dueDate}</span>}
                        <span>Confidence: {Math.round(task.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {suggestions.length > 0 && (
            <Button
              onClick={handleCreateTasks}
              disabled={selectedTasks.size === 0 || creating}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${selectedTasks.size} Task${selectedTasks.size !== 1 ? "s" : ""}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
