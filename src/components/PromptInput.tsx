interface VoiceProfile {
  id: string;
  name: string;
  voice_id: string;
}

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
      className={`bg-zinc-900 border rounded-2xl p-5 transition-all ${
        prompt
          ? "border-emerald-500 ring-4 ring-emerald-500/10"
          : "border-zinc-800"
      }`}
    >
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="A brave little fox who wants to visit the moon..."
        rows={3}
        className="w-full bg-transparent text-zinc-100 text-lg resize-none focus:outline-none placeholder-zinc-600"
      />
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
        <span className="text-xs text-zinc-600">
          Be as detailed or simple as you like
        </span>
        <select
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="bg-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="JBFqnCBsd6RMkjVDRZzb">🎙 George</option>
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
