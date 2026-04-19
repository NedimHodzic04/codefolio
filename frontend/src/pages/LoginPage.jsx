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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Login to your account to continue building your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full py-6 text-lg" variant="outline">
            <a href={`${import.meta.env.VITE_API_URL}/auth/github/`}>
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Log In With GitHub
            </a>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Developer Access
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-zinc-500">
            By clicking continue, you agree to our Terms of Service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
