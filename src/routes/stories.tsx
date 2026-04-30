import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Story } from "../types";
import Button from "../components/Button";
import { Input } from "../components/Input";
import StoryCard from "../components/StoryCard";

export const Route = createFileRoute("/stories")({
  component: StoriesPage,
});

function StoriesPage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"latest" | "top">("latest");

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order(filter === "top" ? "likes" : "created_at", { ascending: false });

      if (!error && data) setStories(data as Story[]);
      setLoading(false);
    };

    fetchStories();
  }, [filter]);

  const filtered = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.sections[0]?.text.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-ink-muted">Loading stories...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Stories</h1>
          <p className="text-ink-muted">
            Browse stories created by the community.
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/generate" })} size="sm">
          + Generate
        </Button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          type="text"
          placeholder="Search stories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48"
        />
        <div className="flex rounded-xl border border-edge-strong overflow-hidden">
          <button
            onClick={() => setFilter("latest")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${filter === "latest" ? "bg-edge-strong text-ink-primary" : "text-ink-muted hover:text-ink-primary"}`}
          >
            Latest
          </button>
          <button
            onClick={() => setFilter("top")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${filter === "top" ? "bg-edge-strong text-ink-primary" : "text-ink-muted hover:text-ink-primary"}`}
          >
            Top
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-faded">No stories found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
