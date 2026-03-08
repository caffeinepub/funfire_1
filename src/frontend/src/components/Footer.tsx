import { Flame, Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="mt-auto border-t border-border/40 bg-background/60 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-fire-gradient">
            <Flame className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-sm font-bold text-fire">
            Funfire
          </span>
        </div>

        {/* Attribution */}
        <p className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
          © {year}. Built with{" "}
          <Heart className="inline h-3 w-3 fill-fire-red text-fire-red" /> using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-fire-orange transition-opacity hover:opacity-80"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
