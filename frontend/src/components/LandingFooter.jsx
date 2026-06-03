import { Link } from "react-router-dom";

const GITHUB_REPO_URL = "https://github.com/NedimHodzic04/codefolio";
const BUILDER_PORTFOLIO_PATH = "/NedimHodzic04";

export default function LandingFooter() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-1 space-y-2">
            <Link className="flex w-fit items-center space-x-2" to="/">
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
            <p className="text-sm text-muted-foreground">
              Developer portfolio generator, powered by GitHub.
            </p>
          </div>

          <div className="flex flex-1 flex-col items-start md:items-center md:text-center">
            <nav className="flex flex-wrap gap-6">
              <Link
                to="/"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Home
              </Link>
              <Link
                to="/showcase"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Showcase
              </Link>
              <a
                href={GITHUB_REPO_URL}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </nav>
          </div>

          <div className="flex flex-1 flex-col items-start md:items-end md:text-right">
            <p className="text-sm text-muted-foreground">
              Built by{" "}
              <Link
                to={BUILDER_PORTFOLIO_PATH}
                className="text-sm font-medium text-foreground hover:underline"
              >
                Nedim Hodžić
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-xs text-muted-foreground">© 2026 Codefolio</p>
        </div>
      </div>
    </footer>
  );
}
