import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="container flex h-14 items-center">
        {/* Logo and Wordmark */}
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
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
            <span className="hidden font-bold sm:inline-block">Codefolio</span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            <a
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </a>
          </nav>

          <div className="flex items-center space-x-2 mx-5">
            <Button>
              <Link to="/login">Join for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
