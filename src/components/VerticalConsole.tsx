import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { VoiceProfile } from "../types";
import { DEFAULT_VOICE_ID } from "../constants";

interface VerticalConsoleProps {
  session: Session | null;
  audioUrl: string | null;
  narrating: boolean;
  voiceProfiles: VoiceProfile[];
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  onNarrate: () => void;
  liked: boolean;
  likes: number;
  onLike: () => void;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
  onShare: () => void;
  isOwner: boolean;
  onDelete: () => void;
}

export default function VerticalConsole({
  session,
  audioUrl,
  narrating,
  voiceProfiles,
  selectedVoice,
  onSelectVoice,
  onNarrate,
  liked,
  likes,
  onLike,
  saved,
  saving,
  onSave,
  onShare,
  isOwner,
  onDelete,
}: VerticalConsoleProps) {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="sticky top-6 w-36 bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 flex flex-col gap-2.5 flex-shrink-0">
      {audioUrl ? (
        <>
          <audio
            src={audioUrl}
            id="story-audio"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <button
            onClick={() => {
              const audio = document.getElementById(
                "story-audio",
              ) as HTMLAudioElement;
              if (!audio) return;
              if (audio.paused) audio.play();
              else audio.pause();
            }}
            className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 px-3 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </>
      ) : (
        <button
          onClick={onNarrate}
          disabled={narrating}
          className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 px-3 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
        >
          {narrating ? "🔊 Generating..." : "🎙 Generate"}
        </button>
      )}

      {voiceProfiles.length > 0 && (
        <select
          value={selectedVoice}
          onChange={(e) => onSelectVoice(e.target.value)}
          className="w-full text-xs bg-zinc-800 border-none text-zinc-100 rounded-xl px-2.5 py-2.5 focus:outline-none cursor-pointer"
        >
          <option value={DEFAULT_VOICE_ID}>🎙 George</option>
          {voiceProfiles.map((v) => (
            <option key={v.id} value={v.voice_id}>
              🎙 {v.name}
            </option>
          ))}
        </select>
      )}

      <div className="h-px bg-zinc-800 my-1" />

      {session && (
        <button
          onClick={onLike}
          className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors"
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          <span className="text-zinc-300">{likes}</span>
        </button>
      )}

      {session && (
        <button
          onClick={onSave}
          disabled={saving}
          className={`border px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors ${saved ? "border-emerald-500/50 text-emerald-400" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}
        >
          🔖 {saved ? "Saved" : "Save"}
        </button>
      )}

      <button
        onClick={onShare}
        className="border border-zinc-700 text-zinc-300 hover:border-zinc-500 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors"
      >
        🔗 Share
      </button>

      <div className="h-px bg-zinc-800 my-1" />

      <button
        onClick={() => navigate({ to: "/generate" })}
        className="border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors"
      >
        + New
      </button>

      {isOwner && (
        <button
          onClick={onDelete}
          className="border border-red-900 text-red-400 hover:bg-red-500/10 px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm transition-colors"
        >
          🗑 Delete
        </button>
      )}
    </div>
  );
}
