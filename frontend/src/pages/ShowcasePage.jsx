import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ShowcasePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Showcase</CardTitle>
              <CardDescription>
                Showcase page is still under development.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button asChild className="w-full py-6 text-lg" variant="outline">
                <Link to="/">Go back to the landing page</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
}