import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Showcase", href: "/showcase" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link className="flex items-center space-x-2" to="/">
          <img src="/favicon-light.svg" className="h-6 w-6 dark:hidden" alt="logo" />
          <img src="/favicon-dark.svg" className="h-6 w-6 hidden dark:block" alt="logo" />
          <span className="font-bold">Codefolio</span>
        </Link>

        {/*test*/}

        {/* Desktop Nav */}
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                      <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">{user.displayName}</div>
                  <div className="px-2 pb-1.5 text-xs text-muted-foreground">@{user.username}</div>
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
            ) : (
              <Button asChild>
                <Link to="/login">Join for Free</Link>
              </Button>
            )}
          </div>

          {/* Mobile Sheet */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="px-0 hover:bg-transparent">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] pt-12">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <nav className="flex flex-col gap-4">
                  {user && (
                    <div className="flex items-center gap-3 pb-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                        <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  )}
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
                  {user ? (
                    <>
                      <Button asChild className="w-full">
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/${user.username}`} onClick={() => setIsOpen(false)}>My Portfolio</Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full">
                        <a href={`${import.meta.env.VITE_API_URL}/auth/logout`}>Logout</a>
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="w-full">
                      <Link to="/login" onClick={() => setIsOpen(false)}>Join for Free</Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
