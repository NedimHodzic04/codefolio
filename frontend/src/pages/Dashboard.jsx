import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import ProfileSection from "@/components/ProfileSection";
import ProjectsSection from "@/components/ProjectsSection";
import EducationSection from "@/components/EducationSection";
import AppearanceSection from "@/components/AppearanceSection";

export default function Dashboard() {
  const { user, loading, refreshUser, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    refreshUser().then((data) => {
      if (data) setCurrentUser(data);
    });
  }, [refreshUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sections = [
    { 
      id: "profile", 
      label: "Profile",
      description: "Manage your personal information and social links"
    },
    { 
      id: "projects", 
      label: "Projects",
      description: "Showcase your work and GitHub repositories"
    },
    { 
      id: "education", 
      label: "Education",
      description: "Add your academic background and certifications"
    },
    { 
      id: "appearance", 
      label: "Appearance",
      description: "Customize your portfolio's look and feel"
    },
  ];

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    setUser(updatedUser);
  };

  const dashboardUser = currentUser ?? user;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage your portfolio and profile
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/${user.username}`)}
            >
              View Portfolio
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <nav className="flex flex-col gap-1">
                    {sections.map((section) => (
                      <Button
                        key={section.id}
                        variant={activeSection === section.id ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveSection(section.id)}
                      >
                        {section.label}
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Tab Navigation - Mobile */}
          <div className="lg:hidden">
            <Card>
              <CardContent className="p-3">
                <nav className="flex gap-2 overflow-x-auto pb-1">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveSection(section.id)}
                      className="whitespace-nowrap"
                    >
                      {section.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {sections.find((s) => s.id === activeSection)?.label}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {sections.find((s) => s.id === activeSection)?.description}
                </p>
              </div>

              <Separator />

              {/* Section Content */}
              {activeSection === "profile" && (
                <ProfileSection user={dashboardUser} onUpdate={handleUserUpdate} />
              )}
              {activeSection === "projects" && (
                <ProjectsSection user={dashboardUser} />
              )}
              {activeSection === "education" && (
                <EducationSection user={dashboardUser} />
              )}
              {activeSection === "appearance" && (
                <AppearanceSection user={dashboardUser} onUpdate={handleUserUpdate} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
