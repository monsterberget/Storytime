import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { session } = useSession();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Storytime
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/stories" className="text-zinc-400 hover:text-zinc-100">
            Stories
          </Link>
          {session && (
            <>
              <Link
                to="/generate"
                className="text-zinc-400 hover:text-zinc-100"
              >
                Generate
              </Link>
              <Link to="/library" className="text-zinc-400 hover:text-zinc-100">
                Library
              </Link>
              <Link
                to="/settings"
                className="text-zinc-400 hover:text-zinc-100"
              >
                Settings
              </Link>
            </>
          )}
          {session ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-zinc-400 hover:text-zinc-100"
            >
              Sign out
            </button>
          ) : (
            <Link to="/" className="text-emerald-400 hover:text-emerald-300">
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
