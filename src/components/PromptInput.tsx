import type { VoiceProfile } from "../types";
import { DEFAULT_VOICE_ID } from "../constants";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  voiceProfiles: VoiceProfile[];
}

export default function PromptInput({
  prompt,
  onPromptChange,
  selectedVoice,
  onVoiceChange,
  voiceProfiles,
}: PromptInputProps) {
  return (
    <div
      className={`bg-surface-raised border rounded-2xl p-5 transition-all ${
        prompt ? "border-brand ring-4 ring-brand/10" : "border-edge"
      }`}
    >
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="A brave little fox who wants to visit the moon..."
        rows={3}
        className="w-full bg-transparent text-ink-primary text-lg resize-none focus:outline-none placeholder-ink-faded"
      />
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-edge">
        <span className="text-xs text-ink-disabled">
          Be as detailed or simple as you like
        </span>
        <select
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="bg-surface-hover text-ink-secondary text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value={DEFAULT_VOICE_ID}>🎙 George</option>
          {voiceProfiles.map((v) => (
            <option key={v.id} value={v.voice_id}>
              🎙 {v.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
