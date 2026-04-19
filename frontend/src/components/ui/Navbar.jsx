import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react"; // install lucide-react if you haven't
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Showcase", href: "/showcase" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Link className="flex items-center space-x-2" to="/">
            <img
              src="/favicon-light.svg"
              className="h-6 w-6 dark:hidden"
              alt="logo"
            />
            <img
              src="/favicon-dark.svg"
              className="h-6 w-6 hidden dark:block"
              alt="logo"
            />
            <span className="font-bold inline-block">Codefolio</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              to={link.href}
              className="transition-colors hover:text-primary text-muted-foreground"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Right: Desktop Auth + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Button asChild>
              <Link to="/login">Join for Free</Link>
            </Button>
          </div>

          {/* Mobile Menu (Sheet) */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="px-0 hover:bg-transparent"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] pt-12">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.title}
                      to={link.href}
                      className="text-lg font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.title}
                    </Link>
                  ))}
                  <hr className="my-2" />
                  <Button asChild className="w-full">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      Join for Free
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
