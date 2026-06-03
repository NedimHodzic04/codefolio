import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import { heroBandClass, sectionHeadingClass } from "@/lib/portfolioThemeClasses";

// Date formatting utility
const formatYear = (dateString) => {
  if (!dateString) return "Present";
  const date = new Date(dateString);
  return date.getFullYear().toString();
};

export default function MinimalLayout({ user, projects, education, theme = "light" }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Track scroll position for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter and sort projects
  const visibleProjects = (projects || [])
    .filter((p) => p.isVisible)
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

  const socials = user?.socials || {};
  const socialLinks = Object.entries(socials)
    .filter(([_, url]) => url)
    .map(([platform, url]) => ({ platform, url }));

  const hasSkills = user?.skills && user.skills.length > 0;

  return (
    <div className={`theme-${theme} min-h-screen bg-background text-foreground pb-20`}>
      {/* Hero Section - Full Screen */}
      <section className={`min-h-screen flex flex-col items-center justify-center px-6 sm:px-8 relative ${heroBandClass}`}>
        <div className="max-w-3xl w-full mx-auto">
          <Avatar className="w-16 h-16 mb-6 ring-2 ring-primary/30">
            <AvatarImage src={user?.avatarUrl} alt={user?.displayName || user?.username} />
            <AvatarFallback>{user?.displayName?.[0] || user?.username?.[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">
            <span className="text-primary">{user?.displayName || user?.username || "Welcome"}</span>
          </h1>
          {user?.bio && (
            <p className="text-lg text-foreground mb-4 truncate hover:whitespace-normal transition-all" title={user.bio}>
              {user.bio}
            </p>
          )}
          {user?.location && (
            <p className="text-sm text-muted-foreground mb-4">{user.location}</p>
          )}
          {socialLinks.length > 0 && (
            <div className="text-sm text-foreground">
              {socialLinks.map(({ platform, url }, index) => (
                <span key={platform}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline text-primary"
                  >
                    {platform}
                  </a>
                  {index < socialLinks.length - 1 && " · "}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-muted-foreground">Scroll</span>
          <ArrowDownIcon className="w-5 h-5 text-primary" />
        </div>
      </section>

      {/* Projects Section */}
      {visibleProjects.length > 0 && (
        <section className="px-6 sm:px-8 py-16">
          <div className="max-w-3xl w-full mx-auto">
            <h2 className={`text-2xl mb-8 ${sectionHeadingClass}`}>Work</h2>
            <div className="space-y-8">
              {visibleProjects.map((project, index) => (
                <div key={project._id}>
                  <div className={`${project.isFeatured ? "border-l-2 border-primary pl-4" : ""}`}>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{project.title}</h3>
                    {project.description && (
                      <p className="text-foreground mb-3">{project.description}</p>
                    )}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.techStack.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="text-sm px-2 py-1 border border-primary/30 bg-primary/10 text-primary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-foreground">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline mr-4"
                        >
                          GitHub
                        </a>
                      )}
                      {project.liveDemo && (
                        <a
                          href={project.liveDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline text-primary"
                        >
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                  {index < visibleProjects.length - 1 && (
                    <div className="border-t border-border mt-8"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {hasSkills && (
        <section className="px-6 sm:px-8 py-16">
          <div className="max-w-3xl w-full mx-auto">
            <h2 className={`text-2xl mb-6 ${sectionHeadingClass}`}>Stack</h2>
            <div className="overflow-x-auto">
              <p className="text-lg text-primary whitespace-nowrap">
                {user.skills.map((skill, index) => (
                  <span key={index}>
                    {skill}
                    {index < user.skills.length - 1 && " / "}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className="px-6 sm:px-8 py-16">
          <div className="max-w-3xl w-full mx-auto space-y-2">
            {education.map((edu) => (
              <p key={edu._id} className="text-sm text-muted-foreground">
                {edu.degree} in {edu.fieldOfStudy}, {edu.institution} · {formatYear(edu.startDate)}–
                {formatYear(edu.endDate)}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="px-6 sm:px-8 py-16">
        <div className="max-w-3xl w-full mx-auto text-center">
          <p className="text-sm text-foreground">
            {user?.email && (
              <a href={`mailto:${user.email}`} className="underline hover:no-underline text-primary">
                {user.email}
              </a>
            )}
            {user?.email && socialLinks.length > 0 && " · "}
            {socialLinks.map(({ platform, url }, index) => (
              <span key={platform}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  {platform}
                </a>
                {index < socialLinks.length - 1 && " · "}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-lg"
          aria-label="Back to top"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
