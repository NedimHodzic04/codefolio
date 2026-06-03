import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useInView, motionStyle, getReducedMotion } from "@/lib/animations";
import LandingFooter from "@/components/LandingFooter";
import previewClassicLight from "@/assets/preview-classic-light.png";
import previewMinimalGreen from "@/assets/preview-minimal-green.png";
import previewModernDark from "@/assets/preview-modern-dark.png";

const githubAuthUrl = `${import.meta.env.VITE_API_URL}/auth/github/`;

const previewGlob = import.meta.glob("../assets/preview-*.png", {
  eager: true,
  import: "default",
});

const PREVIEWS = [
  { src: previewClassicLight, alt: "Default layout · Light theme" },
  { src: previewModernDark, alt: "Modern layout · Dark theme" },
  { src: previewMinimalGreen, alt: "Minimal layout · Green theme" },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    heading: "Sign in with GitHub",
    body: "One click and we pull everything in — your profile, bio, location, and every public repository you've built.",
  },
  {
    number: "02",
    heading: "Curate what gets shown",
    body: "Hide repos you don't want featured, add a tech stack, mark your best work. Takes two minutes, makes a real difference.",
  },
  {
    number: "03",
    heading: "Share your URL",
    body: "Your portfolio is live at code-folio.app/username the moment you sign in. Send it to recruiters, drop it in your bio, put it on your CV.",
  },
];

function GitHubIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function PreviewImage({ src, alt, active }) {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    setResolvedSrc(src);
  }, [src]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={cn(
        "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-1000 ease-in-out",
        active ? "opacity-100" : "opacity-0",
      )}
      onError={() => setResolvedSrc(previewDefaultLight)}
    />
  );
}

function CrossfadeMockup({ contentHeightClass, wrapperClassName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % PREVIEWS.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={wrapperClassName}>
      <div className="w-full overflow-hidden rounded-xl border border-border/50 shadow-2xl md:w-[580px]">
        <div className="flex h-8 items-center gap-1.5 bg-muted/80 px-3 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-red-400/70" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-yellow-400/70" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-green-400/70" aria-hidden />
          <div className="mx-3 flex h-5 flex-1 items-center justify-center rounded-full bg-background/60 px-2">
            <span className="font-mono truncate text-xs text-muted-foreground">
              code-folio.app/username
            </span>
          </div>
        </div>
        <div
          className={cn(
            "relative overflow-hidden rounded-b-xl",
            contentHeightClass,
          )}
          aria-live="polite"
        >
          {PREVIEWS.map((preview, index) => (
            <PreviewImage
              key={preview.alt}
              src={preview.src}
              alt={preview.alt}
              active={index === activeIndex}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {PREVIEWS[activeIndex].alt}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const [reducedMotion] = useState(getReducedMotion);
  const [mounted, setMounted] = useState(() => getReducedMotion());
  const [howRef, howInView] = useInView(reducedMotion);
  const [step1Ref, step1InView] = useInView(reducedMotion);
  const [step2Ref, step2InView] = useInView(reducedMotion);
  const [step3Ref, step3InView] = useInView(reducedMotion);
  const [ctaRef, ctaInView] = useInView(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setMounted(true);
      return;
    }

    const timer = window.setTimeout(() => setMounted(true), 50);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  const showHero = reducedMotion || mounted;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <main>
        <section className="pt-16 pb-16 md:pb-20 md:pt-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid min-h-0 grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-10 lg:gap-14">
              <div className="max-w-xl space-y-6 md:col-span-7">
                <div style={motionStyle(showHero, reducedMotion, 0)}>
                  <Badge className="font-mono text-xs">
                    Free to use · No coding required
                  </Badge>
                </div>

                <h1
                  className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
                  style={motionStyle(showHero, reducedMotion, 100)}
                >
                  Your developer portfolio, generated from GitHub.
                </h1>

                <p
                  className="text-muted-foreground"
                  style={motionStyle(showHero, reducedMotion, 200)}
                >
                  Sign in once, get a portfolio you can share in minutes. Built
                  from your GitHub profile and repos — no setup, no templates to
                  fill out.
                </p>

                <div style={motionStyle(showHero, reducedMotion, 300)}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      asChild
                      size="lg"
                      className="transition-shadow duration-200 hover:shadow-md"
                    >
                      <a href={githubAuthUrl}>
                        <GitHubIcon className="mr-2 h-5 w-5" />
                        Get started with GitHub
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="transition-shadow duration-200 hover:shadow-md"
                    >
                      <Link to="/showcase">Browse showcase</Link>
                    </Button>
                  </div>
                </div>

                <p
                  className="font-mono text-sm text-muted-foreground"
                  style={motionStyle(showHero, reducedMotion, 400)}
                >
                  Built for developers who'd rather ship than design.
                </p>

                <div
                  className="md:hidden"
                  style={motionStyle(showHero, reducedMotion, 450, 12)}
                >
                  <CrossfadeMockup
                    contentHeightClass="h-[280px]"
                    wrapperClassName="w-full max-w-full"
                  />
                </div>
              </div>

              <div
                className="hidden md:col-span-5 md:block"
                style={motionStyle(showHero, reducedMotion, 450, 12)}
              >
                <CrossfadeMockup
                  contentHeightClass="h-[420px]"
                  wrapperClassName="ml-auto w-full max-w-[580px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-24 pb-32 md:pt-32">
          <div className="mx-auto max-w-6xl">
            <div ref={howRef} style={motionStyle(howInView, reducedMotion)}>
              <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                From GitHub to portfolio in minutes.
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                No forms to fill. No design decisions to make. Just sign in and
                your portfolio is ready to share.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
              <div
                ref={step1Ref}
                style={motionStyle(step1InView, reducedMotion, 0)}
              >
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute -top-4 -left-1 text-8xl font-mono text-muted-foreground/5 select-none pointer-events-none"
                  >
                    {HOW_IT_WORKS_STEPS[0].number}
                  </span>
                  <span className="relative font-mono text-5xl font-bold text-muted-foreground/20">
                    {HOW_IT_WORKS_STEPS[0].number}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {HOW_IT_WORKS_STEPS[0].heading}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {HOW_IT_WORKS_STEPS[0].body}
                </p>
              </div>
              <div
                ref={step2Ref}
                style={motionStyle(step2InView, reducedMotion, 150)}
              >
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute -top-4 -left-1 text-8xl font-mono text-muted-foreground/5 select-none pointer-events-none"
                  >
                    {HOW_IT_WORKS_STEPS[1].number}
                  </span>
                  <span className="relative font-mono text-5xl font-bold text-muted-foreground/20">
                    {HOW_IT_WORKS_STEPS[1].number}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {HOW_IT_WORKS_STEPS[1].heading}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {HOW_IT_WORKS_STEPS[1].body}
                </p>
              </div>
              <div
                ref={step3Ref}
                style={motionStyle(step3InView, reducedMotion, 300)}
              >
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute -top-4 -left-1 text-8xl font-mono text-muted-foreground/5 select-none pointer-events-none"
                  >
                    {HOW_IT_WORKS_STEPS[2].number}
                  </span>
                  <span className="relative font-mono text-5xl font-bold text-muted-foreground/20">
                    {HOW_IT_WORKS_STEPS[2].number}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {HOW_IT_WORKS_STEPS[2].heading}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {HOW_IT_WORKS_STEPS[2].body}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted py-24">
          <div
            ref={ctaRef}
            className="mx-auto max-w-6xl px-6 text-center"
            style={motionStyle(ctaInView, reducedMotion)}
          >
            <h2 className="text-3xl font-bold">
              Ready to ship your portfolio?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              It takes two minutes. Sign in with GitHub and your portfolio is
              live.
            </p>
            <Button asChild size="lg" className="mt-8">
              <a href={githubAuthUrl}>
                <GitHubIcon className="mr-2 h-5 w-5" />
                Get started with GitHub
              </a>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
