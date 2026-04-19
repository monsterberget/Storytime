import { Navigate } from "@tanstack/react-router";
import { useSession } from "../hooks/useSession";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
