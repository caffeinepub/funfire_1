import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type { Comment, Post } from "../backend.d";
import { PostType } from "../backend.d";
import { useActor } from "./useActor";

export { PostType };

// ─── Posts ────────────────────────────────────────────────────────────────────

export function useGetAllPosts() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPost(id: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Post>({
    queryKey: ["post", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getPost(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.likePost(id);
    },
    onMutate: async (id: string) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", id] });

      const prevPosts = queryClient.getQueryData<Post[]>(["posts"]);
      const prevPost = queryClient.getQueryData<Post>(["post", id]);

      queryClient.setQueryData<Post[]>(["posts"], (old) =>
        old?.map((p) =>
          p.id === id ? { ...p, likes: p.likes + BigInt(1) } : p,
        ),
      );
      queryClient.setQueryData<Post>(["post", id], (old) =>
        old ? { ...old, likes: old.likes + BigInt(1) } : old,
      );

      return { prevPosts, prevPost };
    },
    onError: (_err, id, context) => {
      if (context?.prevPosts)
        queryClient.setQueryData(["posts"], context.prevPosts);
      if (context?.prevPost)
        queryClient.setQueryData(["post", id], context.prevPost);
    },
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      postType,
      media,
    }: {
      title: string;
      description: string;
      postType: PostType;
      media: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createPost(title, description, postType, media);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deletePost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useGetComments(postId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsForPost(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      author,
      message,
    }: {
      postId: string;
      author: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addComment(postId, author, message);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}
