import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useInView, motionStyle, getReducedMotion } from "@/lib/animations";
import LandingFooter from "@/components/LandingFooter";

const apiUrl = import.meta.env.VITE_API_URL;

export default function ShowcasePage() {
  const [reducedMotion] = useState(getReducedMotion);
  const [mounted, setMounted] = useState(() => getReducedMotion());
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gridRef, gridInView] = useInView(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(true), 50);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  const showHero = reducedMotion || mounted;

  const fetchShowcased = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/showcased`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load showcased developers");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShowcased();
  }, [fetchShowcased]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={fetchShowcased}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="pt-16 pb-16 md:pb-20 md:pt-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl space-y-4">
              <div style={motionStyle(showHero, reducedMotion, 0)}>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Showcase
                </p>
              </div>
              <h1
                className="text-3xl font-bold md:text-4xl"
                style={motionStyle(showHero, reducedMotion, 100)}
              >
                Built by developers, for developers.
              </h1>
              <p
                className="text-muted-foreground"
                style={motionStyle(showHero, reducedMotion, 200)}
              >
                Explore portfolios created by developers using Codefolio. See
                how they present their work, skills, and experience.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-32">
          <div className="mx-auto max-w-6xl">
            {users.length === 0 ? (
              <div className="py-24 text-center text-muted-foreground">
                No showcased developers yet. Check back soon!
              </div>
            ) : (
              <>
                <p className="font-mono text-sm text-muted-foreground mb-6">
                  {users.length} developer{users.length !== 1 ? "s" : ""} showcased
                </p>
                <div
                  ref={gridRef}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {users.map((user, index) => (
                    <Link
                      key={user._id}
                      to={`/${user.username}`}
                      style={motionStyle(gridInView, reducedMotion, index * 100)}
                      className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/80 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border"
                    >
                    <Avatar size="lg">
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={user.displayName || user.username}
                      />
                      <AvatarFallback>
                        {(user.displayName || user.username)[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {user.displayName || user.username}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        <span className="font-mono">@{user.username}</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
            )}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
