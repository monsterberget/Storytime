import { useNavigate } from "@tanstack/react-router";
import type { Story } from "../types";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate({ to: "/story/$id", params: { id: story.id } })}
      className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-600 transition-colors flex flex-col"
    >
      {story.sections[0]?.image_url ? (
        <img
          src={story.sections[0].image_url}
          alt={story.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-zinc-800 flex items-center justify-center">
          <span className="text-4xl">📖</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-semibold text-zinc-100 mb-2 line-clamp-2">
          {story.title}
        </h2>
        <p className="text-zinc-400 text-sm line-clamp-3 flex-1">
          {story.sections[0]?.text}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-zinc-600 text-xs">
            {new Date(story.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <span>❤️ {story.likes}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
