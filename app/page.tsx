import { BitHabitClient } from "@/components/BitHabitClient";

export default function Home() {
  return (
    <main className="container mx-auto p-4 relative overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-4">BitHabit</h1>
      <BitHabitClient />
    </main>
  );
}