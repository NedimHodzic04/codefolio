import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon, ExternalLinkIcon } from "@radix-ui/react-icons";

export default function PortfolioPage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/${username}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Not Found</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Profile */}
        <Card className="shadow-lg">
          <CardContent className="flex items-center gap-6 pt-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <p className="text-zinc-500">@{user.username}</p>
              {user.bio && <p className="text-sm text-zinc-600">{user.bio}</p>}
              {user.location && (
                <p className="text-xs text-zinc-400">{user.location}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {user.skills?.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {user.projects?.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.projects.map((project) => (
                <div
                  key={project._id}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{project.title}</h3>
                    <div className="flex gap-2">
                      {project.githubLink && (
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <GitHubLogoIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {project.liveDemo && (
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={project.liveDemo}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-zinc-500">{project.description}</p>
                  )}
                  {project.language && (
                    <Badge variant="outline" className="text-xs">
                      {project.language}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
