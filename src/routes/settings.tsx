import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
      <p className="text-zinc-400 mb-8">
        Manage your voice profiles and account.
      </p>
      <div className="space-y-6">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-lg font-medium mb-4">Voice Profiles</h2>
          <p className="text-zinc-500 text-sm">
            No voice profiles yet. Record your voice to get started.
          </p>
        </section>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-lg font-medium mb-4">Account</h2>
          <p className="text-zinc-500 text-sm">Account settings coming soon.</p>
        </section>
      </div>
    </div>
  );
}
