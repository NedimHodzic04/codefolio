import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkedInLogoIcon, TwitterLogoIcon, GlobeIcon, GitHubLogoIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { MapPinIcon, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  accentBadgeClass,
  heroBandClass,
  navLinkClass,
  sectionHeadingClass,
  socialButtonClass,
} from "@/lib/portfolioThemeClasses";

// Date formatting utility
const formatDate = (dateString) => {
  if (!dateString) return "Present";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
};

export default function DefaultLayout({ user, projects, education, theme = "light" }) {
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

  const socials = user?.socials || {};
  const socialLinks = Object.entries(socials)
    .filter(([_, url]) => url)
    .map(([platform, url]) => ({ platform, url }));

  const hasSkills = user?.skills && user.skills.length > 0;

  return (
    <div className={`theme-${theme} min-h-screen bg-background text-foreground pb-20`}>
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-[60] bg-card/80 backdrop-blur-sm border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-semibold text-lg text-foreground">
              {user?.username || "Portfolio"}
            </div>
            <div className="hidden md:flex gap-6">
              <a href="#about" className={navLinkClass}>
                About
              </a>
              <a href="#projects" className={navLinkClass}>
                Projects
              </a>
              <a href="#education" className={navLinkClass}>
                Education
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
                      <a href="#projects" className="flex h-11 w-full items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setNavOpen(false)}>Projects</a>
                      <a href="#education" className="flex h-11 w-full items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setNavOpen(false)}>Education</a>
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
      <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${heroBandClass}`}>
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-6 ring-2 ring-primary/30">
            <AvatarImage src={user?.avatarUrl} alt={user?.displayName || user?.username} />
            <AvatarFallback>{user?.displayName?.[0] || user?.username?.[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-primary">{user?.displayName || user?.username || "Welcome"}</span>
          </h1>
          {user?.bio && (
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl">{user.bio}</p>
          )}
          {user?.location && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPinIcon className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {socialLinks.length > 0 && (
            <div className="flex gap-2">
              {socialLinks.map(({ platform, url }) => {
                const Icon = getSocialIcon(platform);
                return (
                  <Button
                    key={platform}
                    variant="ghost"
                    size="icon"
                    className={socialButtonClass}
                    asChild
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platform}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* About & Skills Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid ${hasSkills ? "md:grid-cols-2" : "grid-cols-1"} gap-8`}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {user?.bio || "No bio available."}
              </p>
            </CardContent>
          </Card>
          {hasSkills && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className={accentBadgeClass}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className={`text-3xl mb-8 ${sectionHeadingClass}`}>Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProjects.map((project) => (
            <Card key={project._id} className="shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
              {project.isFeatured && (
                <Badge className="absolute top-2 left-2 z-10" variant="default">
                  Featured
                </Badge>
              )}
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
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.language && (
                    <Badge variant="outline" className="text-xs">
                      {project.language}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-muted-foreground text-sm line-clamp-3">
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
      </section>

      {/* Education Section */}
      {sortedEducation.length > 0 && (
        <section id="education" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className={`text-3xl mb-8 ${sectionHeadingClass}`}>Education</h2>
          <div className="space-y-6">
            {sortedEducation.map((edu) => (
              <Card key={edu._id} className="shadow-lg">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">{edu.institution}</h3>
                  <p className="text-muted-foreground mb-2">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDate(edu.startDate)} → {formatDate(edu.endDate)}
                  </p>
                  {edu.description && (
                    <p className="text-muted-foreground text-sm">{edu.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Contact Footer */}
      <footer id="contact" className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-primary">Get In Touch</h2>
            {user?.email && (
              <Button asChild size="lg">
                <a href={`mailto:${user.email}`}>
                  <EnvelopeClosedIcon className="w-5 h-5 mr-2" />
                  Email Me
                </a>
              </Button>
            )}
            {socialLinks.length > 0 && (
              <div className="flex justify-center gap-6">
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
            <p className="text-sm text-muted-foreground">
              © {currentYear} {user?.displayName || user?.username || "Portfolio"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
