import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LinkedInLogoIcon, TwitterLogoIcon, GlobeIcon, GitHubLogoIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { MapPinIcon, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  accentBadgeClass,
  heroBandClass,
  navLinkClass,
} from "@/lib/portfolioThemeClasses";

// Date formatting utility
const formatDate = (dateString) => {
  if (!dateString) return "Present";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
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

export default function ClassicLayout({ user, projects, education, theme = "light" }) {
  const [navOpen, setNavOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  // Filter and sort projects
  const visibleProjects = (projects || [])
    .filter((p) => p.isVisible)
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

  // Sort education by start date descending
  const sortedEducation = (education || []).sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
    const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
    return dateB - dateA;
  });

  const socials = user?.socials || {};
  const socialLinks = Object.entries(socials)
    .filter(([_, url]) => url)
    .map(([platform, url]) => ({ platform, url }));

  const hasSkills = user?.skills && user.skills.length > 0;

  return (
    <div className={`theme-${theme} min-h-screen bg-background text-foreground pb-20`}>
      {/* Static Top Navigation */}
      <nav className="border-b border-primary/20 bg-background">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-foreground">
              {user?.displayName || user?.username}
            </div>
            <div className="hidden md:flex gap-6">
              <a href="#about" className={navLinkClass}>
                About
              </a>
              <a href="#experience" className={navLinkClass}>
                Experience
              </a>
              {hasSkills && (
                <a href="#skills" className={navLinkClass}>
                  Skills
                </a>
              )}
              <a href="#projects" className={navLinkClass}>
                Projects
              </a>
              <a href="#contact" className={navLinkClass}>
                Contact
              </a>
            </div>
            <div className="md:hidden">
              <Sheet open={navOpen} onOpenChange={setNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[240px] gap-0 p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="flex flex-col px-4 pt-14">
                    <nav className="flex flex-col gap-1">
                      <a href="#about" className="flex h-11 w-full items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setNavOpen(false)}>About</a>
                      <a href="#experience" className="flex h-11 w-full items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setNavOpen(false)}>Experience</a>
                      {hasSkills && <a href="#skills" className="flex h-11 w-full items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setNavOpen(false)}>Skills</a>}
                      <a href="#projects" className="flex h-11 w-full items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setNavOpen(false)}>Projects</a>
                      <a href="#contact" className="flex h-11 w-full items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setNavOpen(false)}>Contact</a>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className={`max-w-6xl mx-auto px-6 py-16 ${heroBandClass}`}>
        <div className="text-center">
          <Avatar className="w-30 h-30 mx-auto mb-6 ring-2 ring-primary/30">
            <AvatarImage src={user?.avatarUrl} alt={user?.displayName || user?.username} />
            <AvatarFallback className="text-2xl">{user?.displayName?.[0] || user?.username?.[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {user?.displayName || user?.username}
          </h1>
          {user?.bio && (
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">{user.bio}</p>
          )}
          {user?.location && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <MapPinIcon className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-4">
              {socialLinks.map(({ platform, url }) => {
                const Icon = getSocialIcon(platform);
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="capitalize">{platform}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Education Timeline */}
      {sortedEducation.length > 0 && (
        <section id="experience" className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-12 text-center text-primary">Education & Experience</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative pl-8">
              {/* Vertical Timeline Line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border"></div>

              {/* Timeline Nodes */}
              <div className="space-y-12">
                {sortedEducation.map((edu) => {
                  const isActive = !edu.endDate;
                  return (
                    <div key={edu._id} className="relative">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-8 top-1 w-4 h-4 rounded-full border-2 ${
                          isActive ? "bg-primary border-primary" : "border-border bg-background"
                        }`}
                      ></div>

                      {/* Content */}
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{edu.institution}</h3>
                        <p className="text-muted-foreground mb-2">
                          {edu.degree} in {edu.fieldOfStudy}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(edu.startDate)} → {formatDate(edu.endDate)}
                          </p>
                          {isActive && (
                            <Badge variant="secondary" className="text-xs text-primary">
                              Present
                            </Badge>
                          )}
                        </div>
                        {edu.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <Separator className="max-w-6xl mx-auto" />

      {/* Skills Section */}
      {hasSkills && (
        <>
          <section id="skills" className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-primary">Skills</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className={`text-sm px-4 py-2 ${accentBadgeClass}`}>
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
          <Separator className="max-w-6xl mx-auto" />
        </>
      )}

      {/* Projects Section */}
      <section id="projects" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center text-primary">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleProjects.map((project) => (
            <Card key={project._id} className="border-2 border-border">
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
                <CardTitle className="text-lg flex items-center gap-2">
                  {project.title}
                  {project.isFeatured && (
                    <span className="text-sm font-normal text-muted-foreground">Featured</span>
                  )}
                </CardTitle>
                {project.language && (
                  <p className="text-sm text-muted-foreground">{project.language}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                )}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 border border-primary/30 bg-primary/10 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-sm text-muted-foreground space-x-4">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline text-primary"
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
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Contact Section */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">Contact</h2>
        <div className="text-center space-y-6">
          {user?.email && (
            <div>
              <Button asChild size="lg">
                <a href={`mailto:${user.email}`}>
                  <EnvelopeClosedIcon className="w-5 h-5 mr-2" />
                  {user.email}
                </a>
              </Button>
            </div>
          )}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-6">
              {socialLinks.map(({ platform, url }) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors capitalize"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} {user?.displayName || user?.username}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
