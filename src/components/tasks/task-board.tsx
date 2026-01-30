"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskData, TaskStatus } from "@/types";
import { TaskColumn } from "./task-column";
import { TaskCard } from "./task-card";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";

interface TaskBoardProps {
  tasks: TaskData[];
  loading: boolean;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-gray-100" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100" },
  { id: "done", title: "Done", color: "bg-green-100" },
];

export function TaskBoard({ tasks, loading }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);
  const { moveTask } = useAppStore();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetColumn.id) {
        // Get position for the task in the new column
        const columnTasks = tasks.filter((t) => t.status === targetColumn.id);
        const newPosition = columnTasks.length;

        // Optimistic update
        moveTask(taskId, targetColumn.id, newPosition);

        // API call
        try {
          const response = await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: targetColumn.id,
              position: newPosition,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update task");
          }
        } catch {
          toast({
            title: "Error",
            description: "Failed to move task. Please try again.",
            variant: "destructive",
          });
          // Revert would happen on next fetch
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-6 h-full">
        {columns.map((column) => {
          const columnTasks = tasks
            .filter((t) => t.status === column.id)
            .sort((a, b) => a.position - b.position);

          return (
            <SortableContext
              key={column.id}
              items={columnTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <TaskColumn
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={columnTasks}
                count={columnTasks.length}
              />
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
