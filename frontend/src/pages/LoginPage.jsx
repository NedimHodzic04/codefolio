import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function LoginPage() {
  return (
    <>
      <div
        className="fixed inset-0 z-0 bg-background dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="fixed inset-0 z-0 hidden bg-background dark:block"
        style={{
          backgroundImage:
            "radial-gradient(circle, #3a3a3a 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
      <Link
        to="/"
        className="mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <img
          src="/favicon-light.svg"
          className="h-9 w-auto shrink-0 dark:hidden"
          alt="Codefolio"
        />
        <img
          src="/favicon-dark.svg"
          className="hidden h-9 w-auto shrink-0 dark:block"
          alt="Codefolio"
        />
        <span className="text-xl font-bold tracking-tight">Codefolio</span>
      </Link>

      <Card className="w-full max-w-md border border-border/60 p-8 shadow-2xl">
        <CardHeader className="space-y-1 px-0 text-center">
          <CardTitle className="text-2xl font-bold">
            Sign in to Codefolio
          </CardTitle>
          <CardDescription>
            Connect your GitHub account to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <Button asChild className="w-full py-6 text-lg" variant="outline">
            <a href={`${import.meta.env.VITE_API_URL}/auth/github/`}>
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Log In With GitHub
            </a>
          </Button>

          <div className="border-t border-border" />

          <p className="text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our Terms of Service.
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Join developers who already have their portfolio live.
      </p>
      </div>
    </>
  );
}
