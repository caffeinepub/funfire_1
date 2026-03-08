import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Mixins
  include MixinStorage();

  // Types
  type PostType = { #text; #image; #video };

  type Post = {
    id : Text;
    title : Text;
    description : Text;
    postType : PostType;
    media : ?Storage.ExternalBlob;
    likes : Nat;
    timestamp : Int;
  };

  type Comment = {
    id : Text;
    postId : Text;
    author : Text;
    message : Text;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Post {
    public func compare(a : Post, b : Post) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  // State management
  let posts = Map.empty<Text, Post>();
  let comments = Map.empty<Text, Comment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Mix in authorization logic using principal
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Post Management
  public shared ({ caller }) func createPost(title : Text, description : Text, postType : PostType, media : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create posts");
    };

    let id = title.concat(Time.now().toText());
    let post = {
      id;
      title;
      description;
      postType;
      media;
      likes = 0;
      timestamp = Time.now();
    };

    posts.add(id, post);
  };

  public shared ({ caller }) func deletePost(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete posts");
    };

    if (not posts.containsKey(id)) {
      Runtime.trap("Post does not exist");
    };
    posts.remove(id);
  };

  public shared ({ caller }) func likePost(id : Text) : async () {
    let post = switch (posts.get(id)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?existingPost) { existingPost };
    };

    let updatedPost = { post with likes = post.likes + 1 };
    posts.add(id, updatedPost);
  };

  public query ({ caller }) func getPost(id : Text) : async Post {
    switch (posts.get(id)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) { post };
    };
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    posts.values().toArray().sort();
  };

  // Comment Management
  public shared ({ caller }) func addComment(postId : Text, author : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    if (not posts.containsKey(postId)) {
      Runtime.trap("Post does not exist");
    };

    let id = postId.concat(Time.now().toText());
    let comment = {
      id;
      postId;
      author;
      message;
      timestamp = Time.now();
    };

    comments.add(id, comment);
  };

  public query ({ caller }) func getCommentsForPost(postId : Text) : async [Comment] {
    comments.values().toArray().filter(
      func(comment) { comment.postId == postId }
    );
  };
};
