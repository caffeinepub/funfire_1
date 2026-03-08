import { FileText, Heart, Image, MessageCircle, Video } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Post } from "../backend.d";
import { PostType } from "../backend.d";
import { useLikePost } from "../hooks/useQueries";
import { formatRelativeTime } from "../utils/time";

interface PostCardProps {
  post: Post;
  index: number;
  commentCount?: number;
  onClick: () => void;
}

const postTypeConfig = {
  [PostType.image]: {
    icon: Image,
    label: "Photo",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  [PostType.video]: {
    icon: Video,
    label: "Video",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  [PostType.text]: {
    icon: FileText,
    label: "Post",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
};

// Sample fallback images for demo posts
const SAMPLE_IMAGES = [
  "/assets/generated/sample-city-night.dim_800x500.jpg",
  "/assets/generated/sample-abstract-fire.dim_800x500.jpg",
  "/assets/generated/sample-mountains-sunset.dim_800x500.jpg",
];

export default function PostCard({
  post,
  index,
  commentCount = 0,
  onClick,
}: PostCardProps) {
  const likeMutation = useLikePost();
  const [liked, setLiked] = useState(false);
  const config = postTypeConfig[post.postType] ?? postTypeConfig[PostType.text];
  const TypeIcon = config.icon;

  // Determine media URL
  const mediaUrl = post.media?.getDirectURL() ?? null;

  // Sample image for demo text posts or posts without media
  const sampleImage = SAMPLE_IMAGES[index % SAMPLE_IMAGES.length];

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likeMutation.isPending) return;
    setLiked(true);
    likeMutation.mutate(post.id);
  };

  return (
    <motion.article
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card fire-border card-glow"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -2 }}
    >
      {/* Media Preview */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {post.postType === PostType.image && mediaUrl ? (
          <img
            src={mediaUrl}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : post.postType === PostType.video && mediaUrl ? (
          <div className="relative h-full w-full">
            <video
              src={mediaUrl}
              className="h-full w-full object-cover"
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fire-gradient shadow-fire-sm">
                <Video className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ) : post.postType === PostType.text ? (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={sampleImage}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="line-clamp-4 text-center font-body text-sm leading-relaxed text-foreground/90">
                {post.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <TypeIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${config.bg} ${config.color} border border-current/20`}
          >
            <TypeIcon className="h-3 w-3" />
            {config.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1.5 line-clamp-2 font-display text-base font-bold leading-snug text-foreground group-hover:text-fire-orange transition-colors duration-200">
          {post.title}
        </h3>
        <p className="mb-3 line-clamp-2 font-body text-sm leading-relaxed text-muted-foreground">
          {post.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-muted-foreground">
            {formatRelativeTime(post.timestamp)}
          </span>

          <div className="flex items-center gap-3">
            {/* Comment count */}
            <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              {commentCount}
            </span>

            {/* Like button */}
            <motion.button
              data-ocid={`feed.like_button.${index + 1}`}
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                liked
                  ? "bg-fire-red/20 text-fire-red"
                  : "text-muted-foreground hover:bg-fire-red/10 hover:text-fire-red"
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                className={`h-3.5 w-3.5 transition-all ${liked ? "fill-current scale-110" : ""}`}
              />
              {Number(post.likes)}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
