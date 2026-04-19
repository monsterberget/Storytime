import { Link } from "@tanstack/react-router";
import type { Story } from "../types";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">
        <Link to={`/stories/${story.id}`} className="hover:underline">
          {story.title}
        </Link>
      </h2>
      <p className="text-gray-600 mb-2">
        By: {story.user_id} {/* Ideally, this would be a username */}
      </p>
      <p className="text-gray-700 mb-4">{story.prompt}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Created: {new Date(story.created_at).toLocaleDateString()}</span>
        <span>Upvotes: {story.upvotes}</span>
      </div>
    </div>
  );
}
