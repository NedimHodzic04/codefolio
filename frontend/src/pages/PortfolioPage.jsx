import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, StarFilledIcon } from "@radix-ui/react-icons";
import { getLayoutComponent } from "@/lib/layoutSelector";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

function CodefolioBadge() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-3 py-1.5 opacity-60 backdrop-blur-sm transition-all hover:opacity-100"
    >
      <img
        src="/favicon-light.svg"
        className="h-4 w-4 dark:hidden"
        alt=""
      />
      <img
        src="/favicon-dark.svg"
        className="hidden h-4 w-4 dark:block"
        alt=""
      />
      <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
        Powered by Codefolio
      </span>
    </Link>
  );
}

export default function PortfolioPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [portfolioUser, setPortfolioUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [showcased, setShowcased] = useState(false);

  useEffect(() => {
    if (portfolioUser) {
      setShowcased(portfolioUser.isShowcased);
    }
  }, [portfolioUser?.isShowcased]);

  useEffect(() => {
    // Remove dark mode class from document root for portfolio pages
    // Portfolio layouts have their own theme system
    const root = document.documentElement;
    const hadDarkClass = root.classList.contains("dark");
    root.classList.remove("dark");

    // Fetch portfolio by username (no auth required)
    fetch(`${import.meta.env.VITE_API_URL}/api/${username}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => setPortfolioUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Cleanup: restore dark mode class if it was there
    return () => {
      if (hadDarkClass) {
        root.classList.add("dark");
      }
    };
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !portfolioUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Not Found</CardTitle>
            <CardDescription>{error || "Portfolio not found"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check if current user is the portfolio owner
  const isOwner = currentUser && currentUser.username === portfolioUser.username;

  const toggleShowcase = async () => {
    setToggling(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/${username}/showcase`,
        { method: "PATCH", credentials: "include" },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to toggle showcase");
      }
      const data = await res.json();
      setShowcased(data.isShowcased);
      toast.success(
        data.isShowcased
          ? "Added to showcase"
          : "Removed from showcase",
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(false);
    }
  };

  // Get the selected layout component
  const LayoutComponent = getLayoutComponent(portfolioUser.layoutTemplate);

  return (
    <div className="relative">
      <LayoutComponent
        user={portfolioUser}
        projects={portfolioUser.projects || []}
        education={portfolioUser.education || []}
        theme={portfolioUser.theme || "light"}
      />

      {/* Owner edit control — top-right so it does not overlap layout scroll buttons */}
      {isOwner && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => navigate("/dashboard")}
            className="shadow-lg"
            size="sm"
            aria-label="Edit Portfolio"
          >
            <Pencil1Icon className="w-4 h-4 mr-2" />
            Edit Portfolio
          </Button>
        </div>
      )}

      {/* Bottom-right controls */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 items-start">
        {currentUser?.isAdmin && (
          <Button
            className="shadow-lg"
            size="sm"
            onClick={toggleShowcase}
            disabled={toggling}
            aria-label={showcased ? "Remove from Showcase" : "Add to Showcase"}
          >
            <StarFilledIcon className="w-4 h-4 mr-2" />
            {toggling
              ? "Updating..."
              : showcased
                ? "Remove from Showcase"
                : "Add to Showcase"}
          </Button>
        )}
        <CodefolioBadge />
      </div>
    </div>
  );
}
