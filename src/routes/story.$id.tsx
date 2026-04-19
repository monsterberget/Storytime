import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Story } from "../types";

export const Route = createFileRoute("/story/$id")({
  component: StoryPage,
});

function StoryPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Story not found.");
      } else {
        setStory(data);
      }
      setLoading(false);
    };

    fetchStory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-400">Loading story...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400">{error || "Story not found."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate({ to: "/stories" })}
        className="text-zinc-400 hover:text-zinc-100 text-sm mb-8 flex items-center gap-2"
      >
        ← Back to stories
      </button>

      <h1 className="text-4xl font-bold tracking-tight mb-2">{story.title}</h1>
      <p className="text-zinc-500 text-sm mb-10">
        {new Date(story.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="space-y-8">
        {story.sections.map((section, index) => (
          <p key={index} className="text-zinc-200 text-lg leading-relaxed">
            {section.text}
          </p>
        ))}
      </div>

      <div className="mt-12 flex gap-3">
        <button
          onClick={() => navigate({ to: "/generate" })}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          Generate another
        </button>
      </div>
    </div>
  );
}
