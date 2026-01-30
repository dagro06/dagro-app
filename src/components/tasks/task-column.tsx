"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskData } from "@/types";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: TaskData[];
  count: number;
}

export function TaskColumn({ id, title, color, tasks, count }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-lg border bg-white overflow-hidden transition-colors",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className={cn("px-4 py-3 border-b", color)}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground bg-white px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-auto min-h-[200px]">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tasks
          </p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
