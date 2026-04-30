import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";

import { THEMES } from "../constants";

const THEME_IMAGES = THEMES.map((t) => t.image);

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { session } = useSession();
  return (
    <div className="min-h-screen bg-surface text-ink-primary">
      {/* Preload theme images */}
      <div className="hidden">
        {THEME_IMAGES.map((src) => (
          <img key={src} src={src} alt="" loading="eager" />
        ))}
      </div>

      <nav className="border-b border-edge px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Storytime
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/stories" className="text-ink-muted hover:text-ink-primary">
            Stories
          </Link>
          {session && (
            <>
              <Link
                to="/generate"
                className="text-ink-muted hover:text-ink-primary"
              >
                Generate
              </Link>
              <Link
                to="/library"
                className="text-ink-muted hover:text-ink-primary"
              >
                Library
              </Link>
              <Link
                to="/settings"
                className="text-ink-muted hover:text-ink-primary"
              >
                Settings
              </Link>
            </>
          )}
          {session ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-ink-muted hover:text-ink-primary"
            >
              Sign out
            </button>
          ) : (
            <Link to="/" className="text-brand hover:text-brand-hover">
              Sign in
            </Link>
          )}
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
