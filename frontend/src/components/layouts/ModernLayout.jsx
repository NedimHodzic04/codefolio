import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LinkedInLogoIcon, TwitterLogoIcon, GlobeIcon, GitHubLogoIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { MapPinIcon } from "lucide-react";
import {
  accentBadgeClass,
  navLinkClass,
  sectionHeadingClass,
} from "@/lib/portfolioThemeClasses";

// Language color mapping
const languageColorMap = {
  JavaScript: "bg-yellow-400 text-yellow-900",
  TypeScript: "bg-blue-600 text-white",
  Python: "bg-blue-500 text-white",
  Go: "bg-cyan-500 text-white",
  Rust: "bg-orange-600 text-white",
  Ruby: "bg-red-600 text-white",
  Java: "bg-red-500 text-white",
  "C++": "bg-pink-600 text-white",
  CSS: "bg-purple-500 text-white",
  HTML: "bg-orange-500 text-white",
};

// Date formatting utility
const formatYear = (dateString) => {
  if (!dateString) return "Present";
  const date = new Date(dateString);
  return date.getFullYear().toString();
};

// Social icon mapping
const getSocialIcon = (platform) => {
  const icons = {
    linkedin: LinkedInLogoIcon,
    twitter: TwitterLogoIcon,
    github: GitHubLogoIcon,
    website: GlobeIcon,
  };
  return icons[platform] || GlobeIcon;
};

export default function ModernLayout({ user, projects, education, theme = "light" }) {

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
  const hasEducation = education && education.length > 0;

  // Sidebar content component (reused for desktop and mobile)
  const SidebarContent = () => (
    <>
      <div className="text-center mb-6">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage src={user?.avatarUrl} alt={user?.displayName || user?.username} />
          <AvatarFallback>{user?.displayName?.[0] || user?.username?.[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {user?.displayName || user?.username}
        </h2>
        {user?.bio && (
          <p className="text-sm text-muted-foreground">{user.bio}</p>
        )}
        {user?.location && (
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
            <MapPinIcon className="w-3 h-3" />
            <span>{user.location}</span>
          </div>
        )}
      </div>

      {hasSkills && (
        <>
          <Separator className="my-4" />
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-primary mb-3">Skills</h3>
            <ul className="space-y-2">
              {user.skills.map((skill, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="mr-2">•</span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {socialLinks.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="mb-6">
            <div className="space-y-2">
              {socialLinks.map(({ platform, url }) => {
                const Icon = getSocialIcon(platform);
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{platform}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </>
      )}

      {hasEducation && (
        <>
          <Separator className="my-4" />
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-primary mb-3">Education</h3>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu._id}>
                  <p className="text-sm font-bold text-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatYear(edu.startDate)}–{formatYear(edu.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator className="my-4" />
      <div className="space-y-2">
        <a
          href="#projects"
          className="block text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Projects
        </a>
        <a
          href="#contact"
          className="block text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Contact
        </a>
      </div>
    </>
  );

  return (
    <div className={`theme-${theme} min-h-screen bg-background`}>
      {/* Desktop: Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[280px] bg-card border-r border-primary/20 overflow-y-auto p-6">
        <SidebarContent />
      </aside>

      {/* Mobile: Compact Top Bar */}
      <div className="lg:hidden bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.avatarUrl} alt={user?.displayName || user?.username} />
            <AvatarFallback>{user?.displayName?.[0] || user?.username?.[0]}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold text-foreground">
            {user?.displayName || user?.username}
          </h2>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="lg:ml-[280px]">
        {/* Hero Banner */}
        <section className="h-[200px] bg-primary/10 border-b border-primary/20 flex items-center justify-center px-6">
          <h1 className="text-4xl font-bold text-foreground">
            Hi, I'm <span className="text-primary">{user?.displayName || user?.username}</span>
          </h1>
        </section>

        {/* Projects Section */}
        <section id="projects" className="px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-3xl mb-8 ${sectionHeadingClass}`}>Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleProjects.map((project) => (
                <Card key={project._id} className="border border-border hover:shadow-lg transition-shadow">
                  {project.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {project.isFeatured && <span className="text-primary">★</span>}
                          {project.title}
                          {project.isFeatured && (
                            <span className="text-xs font-normal text-muted-foreground">Featured</span>
                          )}
                        </CardTitle>
                      </div>
                      {project.language && (
                        <Badge
                          className={`text-xs ${languageColorMap[project.language] || "bg-gray-500 text-white"}`}
                        >
                          {project.language}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {project.description}
                      </p>
                    )}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.map((tech, index) => (
                          <Badge key={index} variant="outline" className={`text-xs ${accentBadgeClass}`}>
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {project.githubLink && (
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                          >
                            <GitHubLogoIcon className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {project.liveDemo && (
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={project.liveDemo}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Live Demo"
                          >
                            <GlobeIcon className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="px-6 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className={`text-3xl mb-6 ${sectionHeadingClass}`}>Contact</h2>
            <div className="flex flex-col items-center gap-4">
              {user?.email && (
                <Button asChild size="lg">
                  <a href={`mailto:${user.email}`}>
                    <EnvelopeClosedIcon className="w-5 h-5 mr-2" />
                    Email Me
                  </a>
                </Button>
              )}
              {socialLinks.length > 0 && (
                <div className="flex gap-6">
                  {socialLinks.map(({ platform, url }) => (
                    <Button key={platform} variant="link" asChild>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="capitalize"
                      >
                        {platform}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mobile: Full Sidebar Content at Bottom */}
        <section className="lg:hidden bg-card border-t border-border px-6 py-8">
          <SidebarContent />
        </section>
      </main>
    </div>
  );
}
