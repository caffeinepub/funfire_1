import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Flame, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { Post } from "../backend.d";
import PostCard from "../components/PostCard";
import { useGetAllPosts, useGetComments } from "../hooks/useQueries";

// Helper to fetch comment counts — we'll use a lightweight approach
function PostCardWrapper({
  post,
  index,
  onNavigate,
}: {
  post: Post;
  index: number;
  onNavigate: (id: string) => void;
}) {
  const { data: comments } = useGetComments(post.id);
  return (
    <PostCard
      post={post}
      index={index}
      commentCount={comments?.length ?? 0}
      onClick={() => onNavigate(post.id)}
    />
  );
}

export default function HomePage() {
  const { data: posts, isLoading, isError } = useGetAllPosts();
  const navigate = useNavigate();

  const sorted = posts
    ? [...posts].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <motion.section
        className="mb-10 overflow-hidden rounded-2xl bg-dark-mesh relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative z-10 flex flex-col items-start gap-4 px-8 py-10 sm:px-12">
          <div className="flex items-center gap-2 rounded-full border border-fire-orange/30 bg-fire-orange/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-fire-yellow" />
            <span className="font-body text-xs font-semibold text-fire-yellow">
              Latest Content
            </span>
          </div>
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            <span className="text-fire">Discover</span>{" "}
            <span className="text-foreground">What&apos;s</span>{" "}
            <span className="text-fire">Hot</span>
          </h1>
          <p className="max-w-xl font-body text-base text-muted-foreground">
            Photos, videos, and stories — download, like, and share your
            thoughts.
          </p>
        </div>
        {/* Background accent */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-fire-gradient" />
        </div>
        <Flame className="absolute bottom-4 right-8 h-24 w-24 opacity-5 text-fire-orange" />
      </motion.section>

      {/* Content Feed */}
      {isLoading && (
        <div
          data-ocid="feed.loading_state"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
            <div key={key} className="overflow-hidden rounded-xl bg-card">
              <Skeleton className="aspect-[16/9] w-full bg-muted" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div
          data-ocid="feed.error_state"
          className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-10 text-center"
        >
          <Flame className="h-10 w-10 text-destructive" />
          <h2 className="font-display text-lg font-bold text-destructive">
            Failed to load posts
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Something went wrong. Please try refreshing the page.
          </p>
        </div>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <div
          data-ocid="feed.empty_state"
          className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card/50 px-8 py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fire-gradient opacity-60">
            <Flame className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            No posts yet
          </h2>
          <p className="max-w-sm font-body text-sm text-muted-foreground">
            The feed is empty right now. Check back soon for fresh photos,
            videos, and stories.
          </p>
        </div>
      )}

      {!isLoading && !isError && sorted.length > 0 && (
        <motion.div
          data-ocid="feed.list"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {sorted.map((post, index) => (
            <div key={post.id} data-ocid={`feed.item.${index + 1}`}>
              <PostCardWrapper
                post={post}
                index={index}
                onNavigate={(id) =>
                  navigate({ to: "/post/$id", params: { id } })
                }
              />
            </div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
