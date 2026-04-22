import { Link } from "react-router-dom";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:py-16">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Shadcn UI</Badge>
            <Badge variant="outline">GitHub Sign-in</Badge>
            <Badge variant="outline">Public portfolio URL</Badge>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your developer portfolio, generated from GitHub.
            </h1>
            <p className="max-w-2xl text-base text-zinc-600 sm:text-lg">
              Codefolio pulls your profile and repos, then lets you publish a clean
              portfolio page you can share in minutes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="py-6 text-base">
              <Link to="/login">
                <GitHubLogoIcon className="mr-2 h-5 w-5" />
                Get started with GitHub
              </Link>
            </Button>
            <Button asChild variant="outline" className="py-6 text-base">
              <a href="/showcase">Browse showcase</a>
            </Button>
          </div>

          <div className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Import projects</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-600">
                  Pull recent repositories and display them with links and language tags.
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Add skills</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-600">
                  Curate a skills list so visitors see your stack immediately.
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Share your URL</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-600">
                  Publish at <span className="font-medium text-zinc-900">/your-username</span>{" "}
                  and keep it updated as you build.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <div className="text-lg font-semibold">Ready to ship your portfolio?</div>
                <div className="text-sm text-zinc-600">
                  Sign in with GitHub and you’ll be redirected to your dashboard.
                </div>
              </div>
              <Button asChild>
                <Link to="/login">Join for free</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
