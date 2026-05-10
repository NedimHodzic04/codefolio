import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LAYOUT_TEMPLATES = [
  {
    id: "default",
    name: "Default",
    description: "A balanced layout with sections arranged vertically",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple design with minimal visual elements",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with bold typography and spacing",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional portfolio layout with a professional feel",
  },
];

const THEMES = [
  {
    id: "light",
    name: "Light",
    description: "Bright and clean appearance",
    colors: ["#ffffff", "#f8f9fa", "#e9ecef"],
  },
  {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes with dark backgrounds",
    colors: ["#1a1a1a", "#2d2d2d", "#404040"],
  },
  {
    id: "blue",
    name: "Blue",
    description: "Professional blue color scheme",
    colors: ["#e3f2fd", "#2196f3", "#1976d2"],
  },
  {
    id: "purple",
    name: "Purple",
    description: "Creative purple color palette",
    colors: ["#f3e5f5", "#9c27b0", "#7b1fa2"],
  },
];

export default function AppearanceSection({ user }) {
  const [selectedLayout, setSelectedLayout] = useState(user?.layoutTemplate || "default");
  const [selectedTheme, setSelectedTheme] = useState(user?.theme || "light");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSaveAppearance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/appearance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          layoutTemplate: selectedLayout,
          theme: selectedTheme,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update appearance");
      }

      toast.success("Appearance updated successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges =
    selectedLayout !== (user?.layoutTemplate || "default") ||
    selectedTheme !== (user?.theme || "light");

  return (
    <div className="space-y-6">
      {/* Layout Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Template</CardTitle>
          <CardDescription>
            Choose how your portfolio content is structured and displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LAYOUT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedLayout(template.id)}
                className={`
                  text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedLayout === template.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }
                `}
              >
                <div className="font-semibold mb-1">{template.name}</div>
                <div className="text-sm text-muted-foreground">
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Color Theme</CardTitle>
          <CardDescription>
            Select a color scheme for your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`
                  text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedTheme === theme.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-1">
                    {theme.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="font-semibold">{theme.name}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {theme.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSaveAppearance}
              disabled={loading || !hasChanges}
              className="flex-1 sm:flex-initial"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/${user?.username}`)}
              className="flex-1 sm:flex-initial"
            >
              View Portfolio
            </Button>
          </div>
          {!hasChanges && (
            <p className="text-sm text-muted-foreground mt-3">
              No changes to save
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
