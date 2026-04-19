import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/story/$id")({
  component: StoryPage,
});

function StoryPage() {
  const { id } = Route.useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Story</h1>
      <p className="text-zinc-500 text-sm mb-8">ID: {id}</p>
      <div className="space-y-8">
        <p className="text-zinc-400">Story content coming soon.</p>
      </div>
    </div>
  );
}
