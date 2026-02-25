import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  type DocumentComment = {
    id : Nat;
    documentId : Nat;
    author : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  type UserProfile = {
    name : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  type Channel = {
    id : Nat;
    name : Text;
    createdBy : Principal;
  };

  type MembersChannel = {
    id : Nat;
    name : Text;
    createdBy : Principal;
  };

  type Message = {
    id : Nat;
    channelId : Nat;
    author : Text;
    content : Text;
    timestamp : Int;
    image : ?Storage.ExternalBlob;
    gif : ?Text;
    replyToId : ?Nat;
  };

  type Sticker = {
    id : Nat;
    image : Storage.ExternalBlob;
    name : Text;
    messageId : ?Nat;
    sender : ?Text;
    channelId : ?Nat;
    timestamp : ?Int;
  };

  type SessionMember = {
    id : Principal;
    nickname : Text;
    joinedAt : Int;
  };

  type Session = {
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

  type Document = {
    id : Nat;
    sessionId : Nat;
    name : Text;
    content : Text;
    revision : Nat;
    locked : Bool;
    createdBy : Principal;
    lastModified : Int;
  };

  type PlayerDocument = {
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

  type ImageReference = {
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

  type DocumentFileReference = {
    id : Nat;
    documentId : Nat;
    file : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
    size : Nat;
    createdBy : Principal;
    lastModified : Int;
  };

  type TurnOrder = {
    sessionId : Nat;
    order : [Text];
    currentIndex : Nat;
  };

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

  // Old actor type (before community system)
  type OldActor = {
    nextSessionId : Nat;
    nextChannelId : Nat;
    nextMessageId : Nat;
    nextDocumentId : Nat;
    nextImageId : Nat;
    nextFileId : Nat;
    nextCommentId : Nat;
    nextStickerId : Nat;
    sessions : Map.Map<Nat, Session>;
    messages : Map.Map<Nat, List.List<Message>>;
    documents : Map.Map<Nat, Document>;
    playerDocumentsMap : Map.Map<Nat, PlayerDocument>;
    turnOrders : Map.Map<Nat, TurnOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    imageReferences : Map.Map<Nat, ImageReference>;
    documentFileReferences : Map.Map<Nat, DocumentFileReference>;
    comments : Map.Map<Nat, DocumentComment>;
    stickers : Map.Map<Nat, Sticker>;
    accessControlState : AccessControl.AccessControlState;
  };

  // New actor type (with community system)
  type NewActor = {
    nextSessionId : Nat;
    nextChannelId : Nat;
    nextMessageId : Nat;
    nextDocumentId : Nat;
    nextImageId : Nat;
    nextFileId : Nat;
    nextCommentId : Nat;
    nextStickerId : Nat;
    sessions : Map.Map<Nat, Session>;
    messages : Map.Map<Nat, List.List<Message>>;
    documents : Map.Map<Nat, Document>;
    playerDocumentsMap : Map.Map<Nat, PlayerDocument>;
    turnOrders : Map.Map<Nat, TurnOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    imageReferences : Map.Map<Nat, ImageReference>;
    documentFileReferences : Map.Map<Nat, DocumentFileReference>;
    comments : Map.Map<Nat, DocumentComment>;
    stickers : Map.Map<Nat, Sticker>;
    accessControlState : AccessControl.AccessControlState;
    nextCommunityId : Nat;
    nextPostId : Nat;
    communities : Map.Map<Nat, Community>;
    communityPosts : Map.Map<Nat, CommunityPost>;
    tabOrders : Map.Map<Nat, List.List<TabData>>;
    memberTabReorderPermissions : Map.Map<Nat, Map.Map<Principal, Bool>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextCommunityId = 1;
      nextPostId = 1;
      communities = Map.empty<Nat, Community>();
      communityPosts = Map.empty<Nat, CommunityPost>();
      tabOrders = Map.empty<Nat, List.List<TabData>>();
      memberTabReorderPermissions = Map.empty<Nat, Map.Map<Principal, Bool>>();
    };
  };
};
