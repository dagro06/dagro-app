"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div></div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Daan Groot</span>
          <Avatar>
            <AvatarFallback>DG</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
