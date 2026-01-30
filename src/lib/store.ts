import { create } from "zustand";
import { UnifiedMessage, TaskData, IntegrationStatus, MessageSource, TaskStatus } from "@/types";

interface AppState {
  // Messages
  messages: UnifiedMessage[];
  messagesLoading: boolean;
  selectedMessageIds: string[];
  messageFilter: MessageSource | "all";
  searchQuery: string;
  setMessages: (messages: UnifiedMessage[]) => void;
  addMessages: (messages: UnifiedMessage[]) => void;
  updateMessage: (id: string, updates: Partial<UnifiedMessage>) => void;
  setMessagesLoading: (loading: boolean) => void;
  setSelectedMessageIds: (ids: string[]) => void;
  toggleMessageSelection: (id: string) => void;
  setMessageFilter: (filter: MessageSource | "all") => void;
  setSearchQuery: (query: string) => void;
  markAsRead: (ids: string[]) => void;
  archiveMessages: (ids: string[]) => void;

  // Tasks
  tasks: TaskData[];
  tasksLoading: boolean;
  selectedTaskId: string | null;
  setTasks: (tasks: TaskData[]) => void;
  addTask: (task: TaskData) => void;
  updateTask: (id: string, updates: Partial<TaskData>) => void;
  deleteTask: (id: string) => void;
  setTasksLoading: (loading: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => void;

  // Integrations
  integrations: IntegrationStatus[];
  setIntegrations: (integrations: IntegrationStatus[]) => void;
  updateIntegration: (provider: string, updates: Partial<IntegrationStatus>) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Messages state
  messages: [],
  messagesLoading: false,
  selectedMessageIds: [],
  messageFilter: "all",
  searchQuery: "",

  setMessages: (messages) => set({ messages }),
  addMessages: (newMessages) =>
    set((state) => ({
      messages: [
        ...state.messages,
        ...newMessages.filter(
          (m) => !state.messages.find((existing) => existing.id === m.id)
        ),
      ],
    })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  setMessagesLoading: (loading) => set({ messagesLoading: loading }),
  setSelectedMessageIds: (ids) => set({ selectedMessageIds: ids }),
  toggleMessageSelection: (id) =>
    set((state) => ({
      selectedMessageIds: state.selectedMessageIds.includes(id)
        ? state.selectedMessageIds.filter((i) => i !== id)
        : [...state.selectedMessageIds, id],
    })),
  setMessageFilter: (filter) => set({ messageFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  markAsRead: (ids) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        ids.includes(m.id) ? { ...m, isRead: true } : m
      ),
    })),
  archiveMessages: (ids) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        ids.includes(m.id) ? { ...m, isArchived: true } : m
      ),
    })),

  // Tasks state
  tasks: [],
  tasksLoading: false,
  selectedTaskId: null,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  setTasksLoading: (loading) => set({ tasksLoading: loading }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  moveTask: (taskId, newStatus, newPosition) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, position: newPosition }
          : t
      ),
    })),

  // Integrations state
  integrations: [],
  setIntegrations: (integrations) => set({ integrations }),
  updateIntegration: (provider, updates) =>
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.provider === provider ? { ...i, ...updates } : i
      ),
    })),

  // UI state
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
