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
  }, [session, sessionLoading, navigate]);

  const fetchVoices = async () => {
    const { data } = await supabase
      .from("voice_profiles")
      .select("*")
      .eq("user_id", session!.user.id)
      .order("created_at", { ascending: false });
    if (data) setVoices(data as VoiceProfile[]);
  };

  useEffect(() => {
    if (!session) return;

    const loadVoices = async () => {
      const { data } = await supabase
        .from("voice_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) setVoices(data as VoiceProfile[]);
    };

    loadVoices();
  }, [session]);

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
        { body: formData },
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
      <p className="text-ink-muted mb-8">
        Manage your voice profiles for AI narration.
      </p>

      <Card padding="lg" className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Record a New Voice</h2>
        <p className="text-ink-muted text-sm mb-2">
          Read the text below clearly and naturally. Try to match the warm,
          storytelling tone you'd use with a child.
        </p>
        <p className="text-ink-muted text-sm mb-2">
          Record at least 30 seconds of clear speech for best results.
        </p>

        <div className="rounded-xl border border-edge-strong bg-surface px-4 py-4 text-sm text-ink-secondary leading-relaxed mb-4 select-all">
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
                className="rounded-xl bg-danger-strong px-5 py-2.5 text-sm font-semibold text-white hover:bg-danger transition-colors"
              >
                🎙 Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="rounded-xl bg-surface-hover px-5 py-2.5 text-sm font-semibold text-white hover:bg-edge-strong transition-colors animate-pulse"
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

          {error && <p className="text-danger text-sm">{error}</p>}
          {success && <p className="text-brand text-sm">{success}</p>}

          {audioBlob && (
            <Button
              onClick={handleSaveVoice}
              disabled={saving}
              className="w-full"
            >
              {saving ? "Cloning voice..." : "Save Voice Profile"}
            </Button>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4">Your Voice Profiles</h2>
        {voices.length === 0 ? (
          <p className="text-ink-faded text-sm">
            No voice profiles yet. Record your voice above!
          </p>
        ) : (
          <div className="space-y-3">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="flex items-center justify-between rounded-xl border border-edge-strong px-4 py-3 gap-3"
              >
                <div className="flex-1 min-w-0">
                  {editingId === voice.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="w-full rounded-lg border border-edge-strong bg-surface-raised px-3 py-1.5 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  ) : (
                    <>
                      <p className="text-sm font-medium text-ink-primary">
                        {voice.name}
                      </p>
                      <p className="text-xs text-ink-faded">
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
                        className="text-xs text-brand hover:text-brand-hover transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-ink-muted hover:text-ink-secondary transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(voice)}
                        className="text-xs text-ink-muted hover:text-ink-primary transition-colors border py-2 px-3 rounded-lg border-edge-strong"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVoice(voice.id)}
                        className="text-xs text-danger hover:text-danger-strong transition-colors border py-2 px-3 rounded-lg border-danger-bg"
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
