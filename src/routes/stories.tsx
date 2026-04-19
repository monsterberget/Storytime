import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stories")({
  component: StoriesPage,
});

function StoriesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Stories of the Week
      </h1>
      <p className="text-zinc-400 mb-8">
        Browse stories created by the community.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <p className="text-zinc-500 col-span-full">
          No stories yet. Be the first to generate one!
        </p>
      </div>
    </div>
  );
}
