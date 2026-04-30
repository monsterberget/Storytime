import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import Card from "../components/Card";
import { Input } from "../components/Input";
import Button from "../components/Button";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

interface VoiceProfile {
  id: string;
  name: string;
  voice_id: string;
  created_at: string;
}

function SettingsPage() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceName, setVoiceName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!sessionLoading && !session) navigate({ to: "/" });
  }, [session, sessionLoading]);

  useEffect(() => {
    if (session) fetchVoices();
  }, [session]);

  const fetchVoices = async () => {
    const { data } = await supabase
      .from("voice_profiles")
      .select("*")
      .eq("user_id", session!.user.id)
      .order("created_at", { ascending: false });
    if (data) setVoices(data);
  };

  const startRecording = async () => {
    setAudioBlob(null);
    setError(null);
    chunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSaveVoice = async () => {
    if (!audioBlob || !voiceName.trim()) {
      setError("Please record your voice and enter a name.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");
      formData.append("name", voiceName);

      const { data, error: fnError } = await supabase.functions.invoke(
        "clone-voice",
        {
          body: formData,
        },
      );

      if (fnError) throw fnError;

      const { error: dbError } = await supabase.from("voice_profiles").insert({
        user_id: session!.user.id,
        name: voiceName,
        voice_id: data.voiceId,
        audio_url: "",
      });

      if (dbError) throw dbError;

      setSuccess("Voice profile saved!");
      setVoiceName("");
      setAudioBlob(null);
      fetchVoices();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };
  const handleStartEdit = (voice: VoiceProfile) => {
    setEditingId(voice.id);
    setEditName(voice.name);
  };

  const handleSaveEdit = async (id: string) => {
    await supabase
      .from("voice_profiles")
      .update({ name: editName })
      .eq("id", id);
    setEditingId(null);
    fetchVoices();
  };

  const handleDeleteVoice = async (id: string) => {
    await supabase.from("voice_profiles").delete().eq("id", id);
    fetchVoices();
  };

  if (sessionLoading) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
      <p className="text-zinc-400 mb-8">
        Manage your voice profiles for AI narration.
      </p>

      {/* Record new voice */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Record a New Voice</h2>
        <p className="text-zinc-400 text-sm mb-2">
          Read the text below clearly and naturally. Try to match the warm,
          storytelling tone you'd use with a child.
        </p>
        <p className="text-zinc-400 text-sm mb-2">
          Record at least 30 seconds of clear speech for best results.
        </p>

        <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-sm text-zinc-300 leading-relaxed mb-4 select-all">
          Once upon a time, in a forest full of tall, whispering trees, there
          lived a small fox named Finn. Finn loved three things more than
          anything else in the world: the smell of rain on dry leaves, the sound
          of birds singing at dawn, and — most of all — stories. Every evening,
          just as the sun dipped below the hills and painted the sky orange and
          pink, Finn would curl up beneath his favourite oak tree and listen.
          The old owl would hoot softly from above. "Are you ready?" she would
          ask. And Finn would always smile and say, "I've been ready all day."
          Tonight, the story was about a brave little girl who crossed seven
          mountains to find a single star that had fallen from the sky. She
          wasn't afraid of the dark, or the cold, or the long winding path ahead
          — because she knew that the most magical things in life are always
          worth the journey.
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Voice name (e.g. Dad's Voice)"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
          />

          <div className="flex gap-3">
            {!recording ? (
              <button
                onClick={startRecording}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-400 transition-colors"
              >
                🎙 Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-600 transition-colors animate-pulse"
              >
                ⏹ Stop Recording
              </button>
            )}

            {audioBlob && (
              <audio
                controls
                src={URL.createObjectURL(audioBlob)}
                className="flex-1 h-10"
              />
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-emerald-400 text-sm">{success}</p>}

          {audioBlob && (
            <button
              onClick={handleSaveVoice}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            >
              {saving ? "Cloning voice..." : "Save Voice Profile"}
            </button>
          )}
        </div>
      </Card>

      {/* Existing voices */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4">Your Voice Profiles</h2>
        {voices.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            No voice profiles yet. Record your voice above!
          </p>
        ) : (
          <div className="space-y-3">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="flex items-center justify-between rounded-xl border border-zinc-700 px-4 py-3 gap-3"
              >
                <div className="flex-1 min-w-0">
                  {editingId === voice.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <>
                      <p className="text-sm font-medium text-zinc-100">
                        {voice.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(voice.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {editingId === voice.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(voice.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(voice)}
                        className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors border py-2 px-3 rounded-lg border-zinc-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVoice(voice.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors border py-2 px-3 rounded-lg border-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
