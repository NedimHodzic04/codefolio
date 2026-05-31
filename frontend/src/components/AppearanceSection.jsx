import { useState, useEffect } from "react";
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
    description: "Clean white with blue accents",
    colors: ["hsl(0 0% 100%)", "hsl(221 83% 53%)", "hsl(210 40% 96%)"],
  },
  {
    id: "dark",
    name: "Dark",
    description: "Deep navy with sky blue primary",
    colors: ["hsl(222 47% 11%)", "hsl(199 89% 48%)", "hsl(217 33% 17%)"],
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark blue-purple with violet tones",
    colors: ["hsl(240 21% 15%)", "hsl(263 70% 60%)", "hsl(240 18% 20%)"],
  },
  {
    id: "nord",
    name: "Nord",
    description: "Cool grey-blue with muted colors",
    colors: ["hsl(220 16% 96%)", "hsl(213 32% 52%)", "hsl(220 13% 91%)"],
  },
  {
    id: "green",
    name: "Green",
    description: "Terminal aesthetic with green accents",
    colors: ["hsl(0 0% 8%)", "hsl(142 76% 36%)", "hsl(0 0% 12%)"],
  },
  {
    id: "rose",
    name: "Rose",
    description: "Warm pink with rose-red primary",
    colors: ["hsl(340 100% 98%)", "hsl(346 77% 50%)", "hsl(340 100% 95%)"],
  },
  {
    id: "purple",
    name: "Purple",
    description: "Soft purple with deep violet primary",
    colors: ["hsl(270 50% 98%)", "hsl(262 83% 58%)", "hsl(270 60% 95%)"],
  },
];

export default function AppearanceSection({ user, onUpdate }) {
  const [selectedLayout, setSelectedLayout] = useState(user?.layoutTemplate || "default");
  const [selectedTheme, setSelectedTheme] = useState(user?.theme || "light");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) return;
    setSelectedLayout(user.layoutTemplate || "default");
    setSelectedTheme(user.theme || "light");
  }, [user?.layoutTemplate, user?.theme]);

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

      const data = await response.json();
      toast.success("Appearance updated successfully");
      if (onUpdate) {
        onUpdate({
          ...user,
          layoutTemplate: data.layoutTemplate,
          theme: data.theme,
        });
      }
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
