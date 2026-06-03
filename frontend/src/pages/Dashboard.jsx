import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
      description: "Manage your personal information and social links",
    },
    {
      id: "projects",
      label: "Projects",
      description: "Showcase your work and GitHub repositories",
    },
    {
      id: "education",
      label: "Education",
      description: "Add your academic background and certifications",
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Customize your portfolio's look and feel",
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
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your portfolio and profile
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/${user.username}`)}
            className="group overflow-hidden"
          >
            View Portfolio
            <span className="inline-block opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">→</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="mx-auto max-w-6xl px-6">
          <nav className="flex gap-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`-mb-px pb-3 pt-3 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "border-b-2 border-foreground text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
        <div className="pb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {sections.find((s) => s.id === activeSection)?.label}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {sections.find((s) => s.id === activeSection)?.description}
          </p>
        </div>

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
    </div>
  );
}
