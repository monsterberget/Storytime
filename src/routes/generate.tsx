import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/generate")({
  component: GeneratePage,
});

function GeneratePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Generate a Story
      </h1>
      <p className="text-zinc-400 mb-8">
        Write a prompt or pick a theme to get started.
      </p>
    </div>
  );
}
