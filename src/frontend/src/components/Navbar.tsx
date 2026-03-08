import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Flame, Home, Loader2, LogIn, LogOut, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Navbar() {
  const { login, clear, loginStatus, identity, isLoggingIn } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      router.navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message === "User is already authenticated"
        ) {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <motion.div
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-fire-gradient shadow-fire-sm"
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <img
              src="/assets/generated/funfire-logo-transparent.dim_120x120.png"
              alt="Funfire"
              className="h-7 w-7 object-contain"
            />
          </motion.div>
          <span className="font-display text-xl font-bold tracking-tight text-fire">
            Funfire
          </span>
        </Link>

        {/* Center Nav */}
        <div className="hidden items-center gap-1 sm:flex">
          <Link to="/">
            {({ isActive }) => (
              <Button
                variant="ghost"
                size="sm"
                data-ocid="nav.home_link"
                className={`gap-2 font-body text-sm font-medium transition-colors ${
                  isActive
                    ? "text-fire-orange"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            )}
          </Link>
          <Link to="/admin">
            {({ isActive }) => (
              <Button
                variant="ghost"
                size="sm"
                data-ocid="nav.upload_link"
                className={`gap-2 font-body text-sm font-medium transition-colors ${
                  isActive
                    ? "text-fire-orange"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            )}
          </Link>
        </div>

        {/* Auth Button */}
        <div className="flex items-center gap-2">
          {/* Mobile nav links */}
          <Link to="/" className="sm:hidden">
            <Button variant="ghost" size="icon" data-ocid="nav.home_link">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/admin" className="sm:hidden">
            <Button variant="ghost" size="icon" data-ocid="nav.upload_link">
              <Upload className="h-4 w-4" />
            </Button>
          </Link>

          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn || loginStatus === "logging-in"}
              data-ocid="nav.logout_button"
              className="gap-2 border-border/60 bg-secondary/50 font-body text-sm hover:border-destructive/60 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              data-ocid="nav.login_button"
              className="gap-2 bg-fire-gradient font-body text-sm font-semibold text-primary-foreground shadow-fire-sm hover:opacity-90 active:scale-95"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isLoggingIn ? "Logging in..." : "Login"}
              </span>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
