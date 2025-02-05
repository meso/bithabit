import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import { Task } from "../types/task";

interface HamburgerMenuProps {
  onAddTask: (
    task: Omit<Task, "id" | "completed" | "progressInSeconds" | "completedAt">,
  ) => void;
}

export function HamburgerMenu({ onAddTask }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTask = (
    task: Omit<Task, "id" | "completed" | "progressInSeconds" | "completedAt">,
  ) => {
    onAddTask(task);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>新規タスクを追加</SheetTitle>
        </SheetHeader>
        <TaskForm onSubmit={handleAddTask} />
      </SheetContent>
    </Sheet>
  );
}
