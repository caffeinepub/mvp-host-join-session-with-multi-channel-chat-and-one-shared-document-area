import Map "mo:core/Map";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

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

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
      case (?session) { session.host == caller };
    };
  };

  func isSessionMember(sessionId : Nat, caller : Principal) : Bool {
    switch (sessions.get(sessionId)) {
      case (null) { false };
      case (?session) {
        session.members.find(
          func(m) { m.id == caller }
        ) != null;
      };
    };
  };

  func getMemberNickname(sessionId : Nat, caller : Principal) : ?Text {
    switch (sessions.get(sessionId)) {
      case (null) { null };
      case (?session) {
        switch (session.members.find(func(m) { m.id == caller })) {
          case (null) { null };
          case (?member) { ?member.nickname };
        };
      };
    };
  };

  func canAccessPlayerDocument(doc : PlayerDocument, caller : Principal) : Bool {
    if (doc.owner == caller) {
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

  // ------------------- User Profile Functions -------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
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

  // ------------------- Community System -------------------

  public type Tab = {
    #home;
    #chat;
    #lore;
    #polls;
    #quizzes;
    #rules;
  };

  public type CommunityPost = {
    id : Nat;
    communityId : Nat;
    authorPrincipal : Principal;
    authorName : Text;
    text : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Time.Time;
  };

  public type Community = {
    id : Nat;
    name : Text;
    host : Principal;
    bannerImage : ?Storage.ExternalBlob;
    primaryColor : ?Text;
    accentColor : ?Text;
    font : ?Text;
    layoutOptions : ?Text;
  };

  public type TabData = {
    tab : Tab;
    order : Nat;
    canReorderMember : Bool;
  };

  var nextCommunityId : Nat = 1;
  var nextPostId : Nat = 1;

  let communities = Map.empty<Nat, Community>();
  let communityPosts = Map.empty<Nat, CommunityPost>();
  let tabOrders = Map.empty<Nat, List.List<TabData>>();
  // Maps communityId -> (memberId -> canReorder)
  let memberTabReorderPermissions = Map.empty<Nat, Map.Map<Principal, Bool>>();

  func isCommunityHost(communityId : Nat, caller : Principal) : Bool {
    switch (communities.get(communityId)) {
      case (null) { false };
      case (?community) { community.host == caller };
    };
  };

  func memberHasTabReorderPermission(communityId : Nat, member : Principal) : Bool {
    switch (memberTabReorderPermissions.get(communityId)) {
      case (null) { false };
      case (?perms) {
        switch (perms.get(member)) {
          case (null) { false };
          case (?allowed) { allowed };
        };
      };
    };
  };

  func callerCanReorderTabs(communityId : Nat, caller : Principal) : Bool {
    if (isCommunityHost(communityId, caller)) {
      return true;
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    memberHasTabReorderPermission(communityId, caller);
  };

  let defaultTabOrder : [TabData] = [
    { tab = #home; order = 0; canReorderMember = false },
    { tab = #chat; order = 1; canReorderMember = false },
    { tab = #lore; order = 2; canReorderMember = false },
    { tab = #polls; order = 3; canReorderMember = false },
    { tab = #quizzes; order = 4; canReorderMember = false },
    { tab = #rules; order = 5; canReorderMember = false },
  ];

  public shared ({ caller }) func createCommunity(name : Text) : async { #ok : Nat; #error : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #error("Unauthorized: Only users can create communities");
    };

    let community : Community = {
      id = nextCommunityId;
      name;
      host = caller;
      bannerImage = null;
      primaryColor = null;
      accentColor = null;
      font = null;
      layoutOptions = null;
    };

    communities.add(nextCommunityId, community);
    tabOrders.add(nextCommunityId, List.fromArray<TabData>(defaultTabOrder));
    nextCommunityId += 1;
    #ok(community.id);
  };

  public query ({ caller }) func getCommunity(communityId : Nat) : async ?Community {
    // Any authenticated user can view community info
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view communities");
    };
    communities.get(communityId);
  };

  public shared ({ caller }) func updateCommunitySettings(
    communityId : Nat,
    bannerImage : ?Storage.ExternalBlob,
    primaryColor : ?Text,
    accentColor : ?Text,
    font : ?Text,
    layoutOptions : ?Text,
  ) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #error("Unauthorized: Only users can update community settings");
    };
    if (not isCommunityHost(communityId, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      return #error("Unauthorized: Only the community host or an admin can update community settings");
    };

    switch (communities.get(communityId)) {
      case (null) { return #error("Community not found") };
      case (?community) {
        let updated : Community = {
          community with
          bannerImage;
          primaryColor;
          accentColor;
          font;
          layoutOptions;
        };
        communities.add(communityId, updated);
        #ok("Community settings updated");
      };
    };
  };

  public query ({ caller }) func getTabs(communityId : Nat) : async [TabData] {
    // Any authenticated user can view tabs
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tabs");
    };

    switch (tabOrders.get(communityId)) {
      case (null) { defaultTabOrder };
      case (?tabs) { tabs.toArray() };
    };
  };

  public query ({ caller }) func canReorder(communityId : Nat, principal : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check reorder permission");
    };
    callerCanReorderTabs(communityId, principal);
  };

  public shared ({ caller }) func reorderTabs(communityId : Nat, newTabOrder : [Tab]) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #error("Unauthorized: Only users can reorder tabs");
    };

    // Only the community host, admins, or members with explicit permission can reorder
    if (not callerCanReorderTabs(communityId, caller)) {
      return #error("Unauthorized: You do not have permission to reorder tabs in this community");
    };

    let existingTabs = switch (tabOrders.get(communityId)) {
      case (?tabs) { tabs.toArray() };
      case (null) { defaultTabOrder };
    };

    let tabToTabData = func(tab : Tab, index : Nat) : TabData {
      switch (existingTabs.find(func(t : TabData) : Bool { t.tab == tab })) {
        case (?tabData) { { tabData with order = index } };
        case (null) {
          {
            tab;
            order = index;
            canReorderMember = false;
          };
        };
      };
    };

    let newTabData = Array.tabulate(
      newTabOrder.size(),
      func(i) { tabToTabData(newTabOrder[i], i) },
    );

    tabOrders.add(communityId, List.fromArray<TabData>(newTabData));
    #ok("Tabs reordered");
  };

  // Host-only: update per-member tab reorder permission
  public shared ({ caller }) func updateMemberTabReorderPermission(
    communityId : Nat,
    member : Principal,
    canReorderTabs : Bool,
  ) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #error("Unauthorized: Only users can update member permissions");
    };

    // Only the community host or admins can grant/revoke tab reorder permissions
    if (not isCommunityHost(communityId, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      return #error("Unauthorized: Only the community host or an admin can update member tab reorder permissions");
    };

    let perms = switch (memberTabReorderPermissions.get(communityId)) {
      case (?existing) { existing };
      case (null) {
        let newMap = Map.empty<Principal, Bool>();
        memberTabReorderPermissions.add(communityId, newMap);
        newMap;
      };
    };

    perms.add(member, canReorderTabs);
    #ok("Member tab reorder permission updated");
  };

  // Host-only: get all member tab reorder permissions for a community
  public query ({ caller }) func getMemberTabReorderPermissions(communityId : Nat) : async [(Principal, Bool)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view member permissions");
    };

    if (not isCommunityHost(communityId, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the community host or an admin can view member tab reorder permissions");
    };

    switch (memberTabReorderPermissions.get(communityId)) {
      case (null) { [] };
      case (?perms) { perms.entries().toArray() };
    };
  };

  public shared ({ caller }) func createCommunityPost(
    communityId : Nat,
    authorName : Text,
    content : Text,
    image : ?Storage.ExternalBlob,
  ) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #error("Unauthorized: Only users can create posts");
    };

    // Verify the community exists
    switch (communities.get(communityId)) {
      case (null) { return #error("Community not found") };
      case (?_) {};
    };

    let post : CommunityPost = {
      id = nextPostId;
      communityId;
      authorPrincipal = caller;
      authorName;
      text = content;
      image;
      timestamp = Time.now();
    };

    communityPosts.add(nextPostId, post);
    nextPostId += 1;
    #ok(post.id.toText());
  };

  public query ({ caller }) func getCommunityPosts(communityId : Nat) : async [CommunityPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    let filteredPosts = communityPosts.values().filter(
      func(p : CommunityPost) : Bool { p.communityId == communityId }
    );
    // Return in reverse chronological order
    let arr = filteredPosts.toArray();
    arr.sort(func(a : CommunityPost, b : CommunityPost) : { #less; #equal; #greater } {
      if (a.timestamp > b.timestamp) { #less }
      else if (a.timestamp < b.timestamp) { #greater }
      else { #equal };
    });
  };
};

