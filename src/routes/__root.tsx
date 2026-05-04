import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";
import { THEMES } from "../constants";

const THEME_IMAGES = THEMES.map((t) => t.image);

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-surface text-ink-primary">
      <div className="hidden">
        {THEME_IMAGES.map((src) => (
          <img key={src} src={src} alt="" loading="eager" />
        ))}
      </div>

      <nav className="border-b border-edge px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Storytime
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4 text-sm">
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
              className="text-danger hover:text-ink-primary"
            >
              Sign out
            </button>
          ) : (
            <Link to="/" className="text-brand hover:text-brand-hover">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-ink-primary p-2"
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden bg-surface-raised border-b border-edge">
          <div className="flex flex-col py-2">
            <Link
              to="/stories"
              onClick={closeMenu}
              className="px-6 py-3 text-ink-secondary hover:bg-surface-hover"
            >
              Stories
            </Link>
            {session && (
              <>
                <Link
                  to="/generate"
                  onClick={closeMenu}
                  className="px-6 py-3 text-ink-secondary hover:bg-surface-hover"
                >
                  Generate
                </Link>
                <Link
                  to="/library"
                  onClick={closeMenu}
                  className="px-6 py-3 text-ink-secondary hover:bg-surface-hover"
                >
                  Library
                </Link>
                <Link
                  to="/settings"
                  onClick={closeMenu}
                  className="px-6 py-3 text-ink-secondary hover:bg-surface-hover"
                >
                  Settings
                </Link>
              </>
            )}
            {session ? (
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  closeMenu();
                }}
                className="text-left px-6 py-3 text-danger hover:bg-surface-hover"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/"
                onClick={closeMenu}
                className="px-6 py-3 text-brand hover:bg-surface-hover"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
