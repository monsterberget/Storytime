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
  const [filter, setFilter] = useState<
    "latest" | "top" | "month" | "year" | "random"
  >("latest");

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      let query = supabase.from("stories").select("*");

      if (filter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query
          .gte("created_at", monthAgo.toISOString())
          .order("likes", { ascending: false });
      } else if (filter === "year") {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        query = query
          .gte("created_at", yearAgo.toISOString())
          .order("likes", { ascending: false });
      } else if (filter === "top") {
        query = query.order("likes", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) {
        let result = data as Story[];
        if (filter === "random") {
          result = [...result].sort(() => Math.random() - 0.5);
        }
        setStories(result);
      }
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
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-xl border border-edge-strong bg-surface-raised px-4 py-2.5 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
        >
          <option value="latest">Latest</option>
          <option value="top">Most liked</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="random">Random</option>
        </select>
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
