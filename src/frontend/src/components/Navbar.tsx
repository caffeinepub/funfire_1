import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Flame, Home, Upload } from "lucide-react";
import { motion } from "motion/react";

export default function Navbar() {
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

        {/* Mobile nav links */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link to="/">
            <Button variant="ghost" size="icon" data-ocid="nav.home_link">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" size="icon" data-ocid="nav.upload_link">
              <Upload className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Funfire brand icon (desktop right) */}
        <div className="hidden sm:flex items-center">
          <Flame className="h-5 w-5 text-fire-orange opacity-60" />
        </div>
      </nav>
    </header>
  );
}
