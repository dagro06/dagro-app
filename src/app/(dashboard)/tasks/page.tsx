"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export default function TasksPage() {
  const { tasks, tasksLoading, setTasks, setTasksLoading } = useAppStore();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            disabled={tasksLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${tasksLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <TaskBoard tasks={tasks} loading={tasksLoading} />

      {/* Create Task Form */}
      <TaskForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
