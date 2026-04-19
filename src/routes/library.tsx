import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Your Library</h1>
      <p className="text-zinc-400 mb-8">Stories you've saved for later.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <p className="text-zinc-500 col-span-full">No saved stories yet.</p>
      </div>
    </div>
  );
}
