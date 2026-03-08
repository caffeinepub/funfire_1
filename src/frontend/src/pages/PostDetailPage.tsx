import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Flame,
  Heart,
  Loader2,
  MessageCircle,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PostType } from "../backend.d";
import {
  useAddComment,
  useGetComments,
  useGetPost,
  useLikePost,
} from "../hooks/useQueries";
import { formatDate, formatRelativeTime } from "../utils/time";

export default function PostDetailPage() {
  const { id } = useParams({ from: "/post/$id" });
  const navigate = useNavigate();

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = useGetPost(id);
  const { data: comments, isLoading: commentsLoading } = useGetComments(id);
  const likeMutation = useLikePost();
  const addCommentMutation = useAddComment();

  const [liked, setLiked] = useState(false);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

  const handleLike = () => {
    if (likeMutation.isPending || !post) return;
    setLiked(true);
    likeMutation.mutate(post.id);
  };

  const handleDownload = async () => {
    if (!post?.media) return;
    try {
      const bytes = await post.media.getBytes();
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext =
        post.postType === PostType.image
          ? "jpg"
          : post.postType === PostType.video
            ? "mp4"
            : "bin";
      a.download = `${post.title.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch {
      toast.error("Download failed. Please try again.");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !post) return;

    try {
      await addCommentMutation.mutateAsync({
        postId: post.id,
        author: author.trim() || "Anonymous",
        message: message.trim(),
      });
      setMessage("");
      setAuthor("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment.");
    }
  };

  if (postLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div data-ocid="post.loading_state" className="space-y-6">
          <Skeleton className="h-8 w-32 bg-muted" />
          <Skeleton className="aspect-video w-full rounded-xl bg-muted" />
          <Skeleton className="h-8 w-2/3 bg-muted" />
          <Skeleton className="h-20 w-full bg-muted" />
        </div>
      </main>
    );
  }

  if (postError || !post) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div
          data-ocid="post.error_state"
          className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-12 text-center"
        >
          <Flame className="h-12 w-12 text-destructive" />
          <h2 className="font-display text-xl font-bold text-destructive">
            Post not found
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            This post may have been deleted or does not exist.
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            variant="outline"
            className="mt-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </main>
    );
  }

  const mediaUrl = post.media?.getDirectURL() ?? null;
  const hasMedia =
    !!post.media &&
    (post.postType === PostType.image || post.postType === PostType.video);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          data-ocid="post.back_button"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>
      </motion.div>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Media */}
        {post.postType === PostType.image && mediaUrl && (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card-hover">
            <img
              src={mediaUrl}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}
        {post.postType === PostType.video && mediaUrl && (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-black shadow-card-hover">
            {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded video; captions not available */}
            <video src={mediaUrl} controls className="w-full max-h-[70vh]" />
          </div>
        )}

        {/* Post Info */}
        <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-6 fire-border">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <h1 className="font-display text-2xl font-black leading-tight text-foreground sm:text-3xl">
                {post.title}
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                {formatDate(post.timestamp)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {hasMedia && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  data-ocid="post.download_button"
                  className="gap-2 border-border/60 bg-secondary/50 font-body hover:border-fire-orange/60 hover:text-fire-orange"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              )}

              <motion.button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                data-ocid="post.like_button"
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  liked
                    ? "bg-fire-red/20 text-fire-red shadow-fire-sm"
                    : "border border-border/60 bg-secondary/50 text-muted-foreground hover:border-fire-red/60 hover:text-fire-red"
                }`}
                whileTap={{ scale: 0.92 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={liked ? "liked" : "unliked"}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Heart
                      className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
                    />
                  </motion.div>
                </AnimatePresence>
                {Number(post.likes)}
              </motion.button>
            </div>
          </div>

          {post.description && (
            <p className="font-body text-base leading-relaxed text-foreground/80">
              {post.description}
            </p>
          )}
        </div>

        {/* Comments Section */}
        <section className="space-y-5 rounded-2xl border border-border/50 bg-card p-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-fire-orange" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Comments{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({comments?.length ?? 0})
              </span>
            </h2>
          </div>

          <Separator className="border-border/50" />

          {/* Comment List */}
          {commentsLoading ? (
            <div data-ocid="comment.loading_state" className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <ul data-ocid="comment.list" className="space-y-4">
              {comments.map((comment, i) => (
                <motion.li
                  key={comment.id}
                  data-ocid={`comment.item.${i + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-fire-gradient text-xs font-bold text-primary-foreground">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm font-semibold text-foreground">
                        {comment.author}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        {formatRelativeTime(comment.timestamp)}
                      </span>
                    </div>
                    <p className="font-body text-sm leading-relaxed text-foreground/80">
                      {comment.message}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div data-ocid="comment.empty_state" className="py-6 text-center">
              <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="font-body text-sm text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}

          <Separator className="border-border/50" />

          {/* Add Comment Form */}
          <form onSubmit={handleComment} className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Leave a Comment
            </h3>
            <div>
              <Label htmlFor="comment-author" className="sr-only">
                Your name
              </Label>
              <Input
                id="comment-author"
                placeholder="Your name (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                data-ocid="comment.input"
                className="border-border/60 bg-secondary/30 font-body placeholder:text-muted-foreground/50 focus-visible:border-fire-orange/60 focus-visible:ring-fire-orange/20"
              />
            </div>
            <div>
              <Label htmlFor="comment-message" className="sr-only">
                Your comment
              </Label>
              <Textarea
                id="comment-message"
                placeholder="Write your comment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                data-ocid="comment.textarea"
                className="border-border/60 bg-secondary/30 font-body placeholder:text-muted-foreground/50 focus-visible:border-fire-orange/60 focus-visible:ring-fire-orange/20 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || addCommentMutation.isPending}
              data-ocid="comment.submit_button"
              className="gap-2 bg-fire-gradient font-body font-semibold text-primary-foreground hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
            {addCommentMutation.isError && (
              <p
                data-ocid="comment.error_state"
                className="font-body text-xs text-destructive"
              >
                Failed to post comment. Try again.
              </p>
            )}
          </form>
        </section>
      </motion.article>
    </main>
  );
}
