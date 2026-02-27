import Map "mo:core/Map";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type DocumentComment = {
    id : Nat;
    documentId : Nat;
    author : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type Channel = {
    id : Nat;
    name : Text;
    createdBy : Principal;
  };

  public type MembersChannel = {
    id : Nat;
    name : Text;
    createdBy : Principal;
  };

  public type Message = {
    id : Nat;
    channelId : Nat;
    author : Text;
    content : Text;
    timestamp : Int;
    image : ?Storage.ExternalBlob;
    gif : ?Text;
    replyToId : ?Nat;
  };

  public type Sticker = {
    id : Nat;
    image : Storage.ExternalBlob;
    name : Text;
    messageId : ?Nat;
    sender : ?Text;
    channelId : ?Nat;
    timestamp : ?Int;
  };

  public type SessionMember = {
    id : Principal;
    nickname : Text;
    joinedAt : Int;
  };

  public type Session = {
    id : Nat;
    name : Text;
    host : Principal;
    passwordHash : ?Blob;
    members : [SessionMember];
    channels : [Channel];
    membersChannels : [MembersChannel];
    createdAt : Int;
    lastActive : Int;
  };

  public type Document = {
    id : Nat;
    sessionId : Nat;
    name : Text;
    content : Text;
    revision : Nat;
    locked : Bool;
    createdBy : Principal;
    lastModified : Int;
  };

  type DocumentWithImages = {
    id : Nat;
    sessionId : Nat;
    name : Text;
    content : Text;
    revision : Nat;
    locked : Bool;
    createdBy : Principal;
    lastModified : Int;
    images : [ImageReference];
  };

  public type PlayerDocument = {
    id : Nat;
    sessionId : Nat;
    owner : Principal;
    name : Text;
    content : Text;
    createdBy : Principal;
    lastModified : Int;
    images : [ImageReference];
    isPrivate : Bool;
  };

  public type PlayerDocumentMetadata = {
    id : Nat;
    sessionId : Nat;
    owner : Principal;
    name : Text;
    createdBy : Principal;
    lastModified : Int;
    isPrivate : Bool;
  };

  public type ImageReference = {
    id : Nat;
    documentId : Nat;
    fileId : Text;
    caption : Text;
    position : Int;
    size : Int;
    createdBy : Principal;
    lastModified : Int;
    title : Text;
  };

  public type DocumentFileReference = {
    id : Nat;
    documentId : Nat;
    file : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
    size : Nat;
    createdBy : Principal;
    lastModified : Int;
  };

  public type DiceRollResult = {
    pattern : Text;
    rolls : [Nat];
    total : Int;
    modifier : Int;
  };

  public type TurnOrder = {
    sessionId : Nat;
    order : [Text];
    currentIndex : Nat;
  };

  public type SessionCreateRequest = {
    name : Text;
    password : ?Text;
    hostNickname : Text;
  };

  public type JoinSessionRequest = {
    sessionId : Nat;
    nickname : Text;
    password : ?Text;
  };

  public type StandardResponse = {
    #ok : Text;
    #error : Text;
  };

  public type UploadFileRequest = {
    documentId : Nat;
    file : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
    size : Nat;
  };

  public type UploadDocumentFileResponse = {
    #ok : Nat;
    #error : Text;
  };

  public type CreateDocumentResponse = {
    #ok : Nat;
    #error : Text;
  };

  public type CreatePlayerDocumentResponse = {
    #ok : Nat;
    #error : Text;
  };

  public type CreateImageResponse = {
    #ok : Nat;
    #error : Text;
  };

  public type AddImageToDocumentResponse = {
    #ok : Nat;
    #error : Text;
  };

  public type SessionExport = {
    session : Session;
    channels : [Channel];
    messages : [Message];
    documents : [Document];
    playerDocuments : [PlayerDocument];
    images : [ImageReference];
    documentFiles : [DocumentFileReference];
    turnOrder : ?TurnOrder;
  };

  public type DocumentMetadata = {
    #session : Document;
    #player : PlayerDocument;
  };

  type CommunityHub = {
    communities : Map.Map<Text, Community>;
  };

  public type Community = {
    id : Text;
    name : Text;
    hostPrincipal : Principal;
    description : Text;
    verified : Bool;
    bannerBlob : ?Blob;
    bannerColor : ?Text;
    bannerFont : ?Text;
    accentColor : ?Text;
  };

  public type CommunityPost = {
    id : Text;
    communityId : Text;
    authorPrincipal : Principal;
    content : Text;
    imageBlob : ?Blob;
    createdAt : Int;
  };

  public type CommunityTabOrder = {
    communityId : Text;
    tabOrder : [Text];
  };

  public type CommunityTabPermissions = {
    communityId : Text;
    membersWithReorderPermission : [Principal];
  };

  var nextSessionId : Nat = 1;
  var nextChannelId : Nat = 1;
  var nextMessageId : Nat = 1;
  var nextDocumentId : Nat = 1;
  var nextImageId : Nat = 1;
  var nextFileId : Nat = 1;
  var nextCommentId : Nat = 1;
  var nextStickerId : Nat = 1;

  let sessions = Map.empty<Nat, Session>();
  let messages = Map.empty<Nat, List.List<Message>>();
  let documents = Map.empty<Nat, Document>();
  let playerDocumentsMap = Map.empty<Nat, PlayerDocument>();
  let turnOrders = Map.empty<Nat, TurnOrder>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let imageReferences = Map.empty<Nat, ImageReference>();
  let documentFileReferences = Map.empty<Nat, DocumentFileReference>();
  let comments = Map.empty<Nat, DocumentComment>();
  let stickers = Map.empty<Nat, Sticker>();
  let communityHub : CommunityHub = { communities = Map.empty<Text, Community>() };
  let communityPosts = Map.empty<Text, List.List<CommunityPost>>();
  let tabOrders = Map.empty<Text, CommunityTabOrder>();
  let tabPermissions = Map.empty<Text, CommunityTabPermissions>();

  func updateSessionActivity(sessionId : Nat) {
    switch (sessions.get(sessionId)) {
      case (null) {};
      case (?session) {
        let updated = {
          session with
          lastActive = Time.now();
        };
        sessions.add(sessionId, updated);
      };
    };
  };

  func hashPassword(password : Text) : Blob {
    let salt = "rpg_session_salt";
    (password # salt).encodeUtf8();
  };

  func verifyPassword(password : Text, hash : Blob) : Bool {
    let computed = hashPassword(password);
    Blob.equal(computed, hash);
  };

  func isSessionHost(sessionId : Nat, caller : Principal) : Bool {
    switch (sessions.get(sessionId)) {
      case (null) { false };
      case (?session) { Principal.equal(session.host, caller) };
    };
  };

  func isSessionMember(sessionId : Nat, caller : Principal) : Bool {
    switch (sessions.get(sessionId)) {
      case (null) { false };
      case (?session) {
        session.members.find(
          func(m) { Principal.equal(m.id, caller) }
        ) != null;
      };
    };
  };

  func getMemberNickname(sessionId : Nat, caller : Principal) : ?Text {
    switch (sessions.get(sessionId)) {
      case (null) { null };
      case (?session) {
        switch (session.members.find(func(m) { Principal.equal(m.id, caller) })) {
          case (null) { null };
          case (?member) { ?member.nickname };
        };
      };
    };
  };

  func canAccessPlayerDocument(doc : PlayerDocument, caller : Principal) : Bool {
    if (Principal.equal(doc.owner, caller)) {
      return true;
    };
    if (doc.isPrivate) {
      return isSessionHost(doc.sessionId, caller);
    };
    isSessionMember(doc.sessionId, caller);
  };

  func getSessionIdForChannel(channelId : Nat) : ?Nat {
    for ((sessionId, session) in sessions.entries()) {
      let hasChannel = session.channels.find(func(ch) { ch.id == channelId }) != null;
      if (hasChannel) {
        return ?sessionId;
      };
      let hasMembersChannel = session.membersChannels.find(func(ch) { ch.id == channelId }) != null;
      if (hasMembersChannel) {
        return ?sessionId;
      };
    };
    null;
  };

  // Private helper: check if a principal is the community host
  func checkIsCommunityHost(communityId : Text, member : Principal) : Bool {
    switch (communityHub.communities.get(communityId)) {
      case (null) { false };
      case (?community) { Principal.equal(community.hostPrincipal, member) };
    };
  };

  // Private helper: check if a principal is the community host or has tab reorder permission
  func checkIsCommunityHostOrPermitted(communityId : Text, member : Principal) : Bool {
    if (checkIsCommunityHost(communityId, member)) {
      return true;
    };
    switch (tabPermissions.get(communityId)) {
      case (null) { false };
      case (?permissions) {
        permissions.membersWithReorderPermission.find(
          func(p) { Principal.equal(p, member) }
        ) != null;
      };
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func removeProfilePicture() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove profile pictures");
    };

    switch (userProfiles.get(caller)) {
      case (null) {};
      case (?profile) {
        let newProfile = { profile with profilePicture = null };
        userProfiles.add(caller, newProfile);
      };
    };
  };

  // ------------------- Community API -------------------

  public shared ({ caller }) func createPost(communityId : Text, content : Text, imageBlob : ?Blob) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create posts");
    };

    if (not communityHub.communities.containsKey(communityId)) {
      Runtime.trap("Community not found");
    };

    let now = Time.now();
    let postId = communityId # "_" # now.toText();

    let newPost : CommunityPost = {
      id = postId;
      communityId;
      authorPrincipal = caller;
      content;
      imageBlob;
      createdAt = now;
    };

    switch (communityPosts.get(communityId)) {
      case (null) {
        let newPostList = List.singleton<CommunityPost>(newPost);
        communityPosts.add(communityId, newPostList);
      };
      case (?posts) {
        posts.add(newPost);
      };
    };

    ?postId;
  };

  // Public read: no auth required — anyone can view posts
  public query func getPosts(communityId : Text) : async [CommunityPost] {
    switch (communityPosts.get(communityId)) {
      case (null) { [] };
      case (?posts) { posts.toArray() };
    };
  };

  // Public read: no auth required — anyone can view tab order
  public query func getTabOrder(communityId : Text) : async [Text] {
    switch (tabOrders.get(communityId)) {
      case (null) { [] };
      case (?order) {
        Array.tabulate<Text>(
          order.tabOrder.size(),
          func(i) { order.tabOrder[i] },
        );
      };
    };
  };

  public shared ({ caller }) func updateTabOrder(communityId : Text, newOrder : [Text]) : async () {
    // Must be an authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update tab order");
    };
    // Must be the community host or a member with reorder permission
    if (not checkIsCommunityHostOrPermitted(communityId, caller)) {
      Runtime.trap("Unauthorized: You do not have permission to update the tab order for this community");
    };
    let updatedOrder : CommunityTabOrder = {
      communityId;
      tabOrder = newOrder;
    };
    tabOrders.add(communityId, updatedOrder);
  };

  public shared ({ caller }) func updateBannerSettings(
    communityId : Text,
    bannerBlob : ?Blob,
    bannerColor : ?Text,
    bannerFont : ?Text,
    accentColor : ?Text,
  ) : async () {
    // Must be an authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can edit banners");
    };
    // Must be the community host
    if (not checkIsCommunityHost(communityId, caller)) {
      Runtime.trap("Unauthorized: Only the community host can edit banner settings");
    };

    let community = switch (communityHub.communities.get(communityId)) {
      case (null) { Runtime.trap("Community with id " # communityId # " does not exist") };
      case (?c) { c };
    };

    let updatedCommunity : Community = {
      community with
      bannerBlob;
      bannerColor;
      bannerFont;
      accentColor;
    };

    communityHub.communities.add(communityId, updatedCommunity);
  };

  public shared ({ caller }) func grantTabReorderPermission(communityId : Text, principal : Principal) : async () {
    // Must be an authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can grant permissions");
    };
    // Must be the community host
    if (not checkIsCommunityHost(communityId, caller)) {
      Runtime.trap("Unauthorized: Only the community host can grant tab reorder permission");
    };

    let existingPermissions = tabPermissions.get(communityId);
    let updatedPermissions = switch (existingPermissions) {
      case (null) {
        {
          communityId;
          membersWithReorderPermission = [principal];
        };
      };
      case (?permissions) {
        {
          permissions with
          membersWithReorderPermission = permissions.membersWithReorderPermission.concat([principal]);
        };
      };
    };

    tabPermissions.add(communityId, updatedPermissions);
  };

  public shared ({ caller }) func revokeTabReorderPermission(communityId : Text, principal : Principal) : async () {
    // Must be an authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can revoke permissions");
    };
    // Must be the community host
    if (not checkIsCommunityHost(communityId, caller)) {
      Runtime.trap("Unauthorized: Only the community host can revoke tab reorder permission");
    };

    switch (tabPermissions.get(communityId)) {
      case (null) {};
      case (?permissions) {
        let updatedMembers = permissions.membersWithReorderPermission.filter(
          func(member) { not Principal.equal(member, principal) }
        );
        let updatedPermissions = {
          permissions with
          membersWithReorderPermission = updatedMembers;
        };
        tabPermissions.add(communityId, updatedPermissions);
      };
    };
  };

  // Public read: no auth required — anyone can view tab permissions
  public query func getTabPermissions(communityId : Text) : async [Principal] {
    switch (tabPermissions.get(communityId)) {
      case (null) { [] };
      case (?permissions) {
        permissions.membersWithReorderPermission;
      };
    };
  };

  // Public read: no auth required — anyone can check if a principal is host or permitted
  public query func isCommunityHostOrPermitted(communityId : Text, member : Principal) : async Bool {
    checkIsCommunityHostOrPermitted(communityId, member);
  };

  // Public read: no auth required — anyone can check if a principal is the community host
  public query func isCommunityHost(communityId : Text, member : Principal) : async Bool {
    checkIsCommunityHost(communityId, member);
  };
};

