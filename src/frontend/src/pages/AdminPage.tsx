import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  CloudUpload,
  FileText,
  Flame,
  Image,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Shield,
  Trash2,
  Upload,
  User,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import {
  PostType,
  useCreatePost,
  useDeletePost,
  useGetAllPosts,
} from "../hooks/useQueries";
import { formatRelativeTime } from "../utils/time";

const ADMIN_USERNAME = "Pra2008";
const ADMIN_PASSWORD = "PRAVEEN2008";

const POST_TYPE_OPTIONS = [
  { value: PostType.text, label: "Text Post", icon: FileText, accept: "" },
  { value: PostType.image, label: "Image", icon: Image, accept: "image/*" },
  { value: PostType.video, label: "Video", icon: Video, accept: "video/*" },
];

export default function AdminPage() {
  const { data: posts, isLoading: postsLoading } = useGetAllPosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();

  // Username/password gate state
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postType, setPostType] = useState<PostType>(PostType.text);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptsFile =
    postType === PostType.image || postType === PostType.video;
  const selectedTypeConfig = POST_TYPE_OPTIONS.find(
    (o) => o.value === postType,
  );

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingLogin(true);
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setAdminLoggedIn(true);
    } else {
      setLoginError("Invalid username or password");
    }
    setIsSubmittingLogin(false);
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setUsernameInput("");
    setPasswordInput("");
    setLoginError("");
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && acceptsFile) setFile(dropped);
    },
    [acceptsFile],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let media: ExternalBlob | null = null;
    if (acceptsFile && file) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      media = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    }

    try {
      setUploadProgress(0);
      await createPost.mutateAsync({ title, description, postType, media });
      setTitle("");
      setDescription("");
      setFile(null);
      setUploadProgress(0);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success("Post published successfully!");
    } catch {
      toast.error("Failed to publish post. Try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success("Post deleted.");
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  // Loading state
  if (postsLoading && adminLoggedIn) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div data-ocid="admin.loading_state" className="space-y-6">
          <Skeleton className="h-10 w-48 bg-muted" />
          <Skeleton className="h-64 w-full rounded-xl bg-muted" />
        </div>
      </main>
    );
  }

  // Step 1: Username/password gate — show login form if not yet passed
  if (!adminLoggedIn) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-border/50 bg-card p-8 fire-border shadow-fire-sm"
        >
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fire-gradient shadow-fire">
              <KeyRound className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-black text-fire">
                Admin Login
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Enter your credentials to access the panel
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-username"
                className="font-body text-sm font-medium text-foreground/80"
              >
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-username"
                  type="text"
                  placeholder="Enter username"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setLoginError("");
                  }}
                  required
                  autoComplete="username"
                  data-ocid="admin.username_input"
                  className="pl-9 border-border/60 bg-secondary/30 font-body placeholder:text-muted-foreground/50 focus-visible:border-fire-orange/60 focus-visible:ring-fire-orange/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                className="font-body text-sm font-medium text-foreground/80"
              >
                Password
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError("");
                  }}
                  required
                  autoComplete="current-password"
                  data-ocid="admin.password_input"
                  className="pl-9 border-border/60 bg-secondary/30 font-body placeholder:text-muted-foreground/50 focus-visible:border-fire-orange/60 focus-visible:ring-fire-orange/20"
                />
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  data-ocid="admin.login.error_state"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3"
                >
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="font-body text-sm text-destructive">
                    {loginError}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmittingLogin || !usernameInput || !passwordInput}
              data-ocid="admin.login_submit_button"
              className="w-full gap-2 bg-fire-gradient font-body font-semibold text-primary-foreground shadow-fire-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmittingLogin ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    );
  }

  const sortedPosts = posts
    ? [...posts].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fire-gradient shadow-fire-sm">
            <Upload className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-black text-fire">
              Admin Panel
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Upload and manage content
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdminLogout}
            data-ocid="admin.logout_button"
            className="gap-2 font-body text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Upload Form */}
        <section className="rounded-2xl border border-border/50 bg-card p-6 fire-border space-y-5">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-fire-orange" />
            Create New Post
          </h2>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                data-ocid="admin.success_state"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3"
              >
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="font-body text-sm text-green-400">
                  Post published successfully!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Post Type */}
            <div className="space-y-1.5">
              <Label
                htmlFor="post-type"
                className="font-body text-sm font-medium text-foreground/80"
              >
                Post Type
              </Label>
              <Select
                value={postType}
                onValueChange={(v) => {
                  setPostType(v as PostType);
                  setFile(null);
                }}
              >
                <SelectTrigger
                  id="post-type"
                  data-ocid="admin.select"
                  className="border-border/60 bg-secondary/30 font-body focus:border-fire-orange/60 focus:ring-fire-orange/20"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {POST_TYPE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="font-body"
                    >
                      <span className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="post-title"
                className="font-body text-sm font-medium text-foreground/80"
              >
                Title <span className="text-fire-red">*</span>
              </Label>
              <Input
                id="post-title"
                placeholder="Give your post a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                data-ocid="admin.title_input"
                className="border-border/60 bg-secondary/30 font-body placeholder:text-muted-foreground/50 focus-visible:border-fire-orange/60 focus-visible:ring-fire-orange/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="post-desc"
                className="font-body text-sm font-medium text-foreground/80"
              >
                Description
              </Label>
              <Textarea
                id="post-desc"
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-ocid="admin.textarea"
                className="border-border/60 bg-secondary/30 font-body placeholder:text-muted-foreground/50 focus-visible:border-fire-orange/60 focus-visible:ring-fire-orange/20 resize-none"
              />
            </div>

            {/* File Upload */}
            {acceptsFile && (
              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium text-foreground/80">
                  {postType === PostType.image ? "Image" : "Video"} File
                </Label>

                {/* Drag-and-drop zone */}
                <div
                  data-ocid="admin.dropzone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative rounded-xl border-2 border-dashed transition-colors ${
                    isDragging
                      ? "border-fire-orange bg-fire-orange/5"
                      : file
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-border/60 bg-secondary/20 hover:border-fire-orange/40 hover:bg-fire-orange/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full cursor-pointer flex-col items-center gap-3 p-8 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                  >
                    {file ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-green-400" />
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <CloudUpload
                          className={`h-8 w-8 ${isDragging ? "text-fire-orange" : "text-muted-foreground"}`}
                        />
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">
                            Drop file here or{" "}
                            <span className="text-fire-orange">browse</span>
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {postType === PostType.image
                              ? "PNG, JPG, GIF, WebP"
                              : "MP4, WebM, MOV"}
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedTypeConfig?.accept}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  data-ocid="admin.upload_button"
                  className="sr-only"
                />
              </div>
            )}

            {/* Upload Progress */}
            {createPost.isPending && uploadProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-body text-xs text-muted-foreground">
                    Uploading...
                  </span>
                  <span className="font-body text-xs text-fire-orange">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-fire-gradient transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {createPost.isError && (
              <div
                data-ocid="admin.error_state"
                className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3"
              >
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="font-body text-sm text-destructive">
                  Failed to publish post.
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={!title.trim() || createPost.isPending}
              data-ocid="admin.submit_button"
              className="w-full gap-2 bg-fire-gradient font-body font-semibold text-primary-foreground shadow-fire-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Flame className="h-4 w-4" />
                  Publish Post
                </>
              )}
            </Button>
          </form>
        </section>

        {/* Existing Posts Management */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
              Manage Posts
            </h2>
            <Badge variant="secondary" className="font-body">
              {posts?.length ?? 0} posts
            </Badge>
          </div>

          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted" />
              ))}
            </div>
          ) : sortedPosts.length === 0 ? (
            <div
              data-ocid="admin.post.empty_state"
              className="rounded-xl border border-border/50 bg-card/50 p-8 text-center"
            >
              <p className="font-body text-sm text-muted-foreground">
                No posts yet. Create your first post above!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  data-ocid={`admin.post.item.${index + 1}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-center gap-4 rounded-xl border border-border/40 bg-card px-4 py-3"
                >
                  {/* Type Icon */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                    {post.postType === PostType.image && (
                      <Image className="h-4 w-4 text-blue-400" />
                    )}
                    {post.postType === PostType.video && (
                      <Video className="h-4 w-4 text-purple-400" />
                    )}
                    {post.postType === PostType.text && (
                      <FileText className="h-4 w-4 text-green-400" />
                    )}
                  </div>

                  {/* Post Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-foreground truncate">
                      {post.title}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {formatRelativeTime(post.timestamp)} ·{" "}
                      {Number(post.likes)} likes
                    </p>
                  </div>

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`admin.post.delete_button.${index + 1}`}
                        className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-border/60 bg-popover">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display text-foreground">
                          Delete this post?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-body text-muted-foreground">
                          &quot;{post.title}&quot; will be permanently deleted.
                          This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          data-ocid="admin.post.cancel_button"
                          className="font-body"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(post.id)}
                          data-ocid="admin.post.confirm_button"
                          className="bg-destructive font-body text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletePost.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </main>
  );
}
