import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Showcase", href: "/showcase" },
];

function NavLink({ to, children }) {
  return (
    <Button variant="ghost" className="h-9 px-3" asChild>
      <Link to={to}>{children}</Link>
    </Button>
  );
}

function MobileNavLink({ to, children, onNavigate }) {
  return (
    <Button
      variant="ghost"
      className="h-11 w-full justify-start px-3 text-base font-medium"
      asChild
    >
      <Link to={to} onClick={onNavigate}>
        {children}
      </Link>
    </Button>
  );
}

function ProfileControl() {
  const { user } = useAuth();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-sm font-medium">{user.displayName}</div>
          <div className="px-2 pb-1.5 text-xs text-muted-foreground">
            @{user.username}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/${user.username}`}>My Portfolio</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={`${import.meta.env.VITE_API_URL}/auth/logout`}>Logout</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
      <Link to="/login" aria-label="Sign in">
        <User className="h-5 w-5" />
      </Link>
    </Button>
  );
}

function MobileMenu({ isOpen, onOpenChange }) {
  const { user } = useAuth();
  const close = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] gap-0 p-0">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex flex-col px-4 pb-6 pt-14">
          {user && (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
            </>
          )}

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <MobileNavLink key={link.href} to={link.href} onNavigate={close}>
                {link.title}
              </MobileNavLink>
            ))}
          </nav>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Button className="w-full" asChild>
                  <Link to="/dashboard" onClick={close}>
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/${user.username}`} onClick={close}>
                    My Portfolio
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <a href={`${import.meta.env.VITE_API_URL}/auth/logout`}>
                    Logout
                  </a>
                </Button>
              </>
            ) : (
              <Button className="w-full" asChild>
                <Link to="/login" onClick={close}>
                  Sign in
                </Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link className="flex items-center space-x-2" to="/">
          <img
            src="/favicon-light.svg"
            className="h-6 w-6 dark:hidden"
            alt=""
          />
          <img
            src="/favicon-dark.svg"
            className="hidden h-6 w-6 dark:block"
            alt=""
          />
          <span className="font-bold">Codefolio</span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} to={link.href}>
                {link.title}
              </NavLink>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <div className="hidden md:block">
            <ProfileControl />
          </div>

          <div className="md:hidden">
            <MobileMenu isOpen={isOpen} onOpenChange={setIsOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}
