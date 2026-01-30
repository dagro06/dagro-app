import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes === 0) return "Just now";
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    slack: "bg-[#4A154B]",
    outlook: "bg-[#0078D4]",
    notion: "bg-black",
    clickup: "bg-[#7B68EE]",
    gdrive: "bg-[#4285F4]",
  };
  return colors[source] || "bg-gray-500";
}

export function getSourceIcon(source: string): string {
  const icons: Record<string, string> = {
    slack: "MessageSquare",
    outlook: "Mail",
    notion: "FileText",
    clickup: "CheckSquare",
    gdrive: "HardDrive",
  };
  return icons[source] || "Circle";
}

export function getPriorityColor(priority?: string): string {
  const colors: Record<string, string> = {
    urgent: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-green-600 bg-green-50 border-green-200",
  };
  return colors[priority || ""] || "text-gray-600 bg-gray-50 border-gray-200";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    todo: "bg-gray-100 text-gray-700",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}
