import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type DocumentComment = {
    id : Nat;
    documentId : Nat;
    author : Principal;
    text : Text;
    timestamp : Int;
  };

  type UserProfile = {
    name : Text;
    profilePicture : ?Blob;
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
    image : ?Blob;
    gif : ?Text;
    replyToId : ?Nat;
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

  type DocumentFileReference = {
    id : Nat;
    documentId : Nat;
    file : Blob;
    filename : Text;
    mimeType : Text;
    size : Nat;
    createdBy : Principal;
    lastModified : Int;
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

  type DiceRollResult = {
    pattern : Text;
    rolls : [Nat];
    total : Int;
    modifier : Int;
  };

  type TurnOrder = {
    sessionId : Nat;
    order : [Text];
    currentIndex : Nat;
  };

  type Sticker = {
    id : Nat;
    image : Blob;
    name : Text;
    messageId : ?Nat;
    sender : ?Text;
    channelId : ?Nat;
    timestamp : ?Int;
  };

  type OldActor = {
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
    nextSessionId : Nat;
    nextChannelId : Nat;
    nextMessageId : Nat;
    nextDocumentId : Nat;
    nextImageId : Nat;
    nextFileId : Nat;
    nextCommentId : Nat;
    nextStickerId : Nat;
  };

  type Community = {
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

  type CommunityPost = {
    id : Text;
    communityId : Text;
    authorPrincipal : Principal;
    content : Text;
    imageBlob : ?Blob;
    createdAt : Int;
  };

  type CommunityTabOrder = {
    communityId : Text;
    tabOrder : [Text];
  };

  type CommunityTabPermissions = {
    communityId : Text;
    membersWithReorderPermission : [Principal];
  };

  type CommunityHub = {
    communities : Map.Map<Text, Community>;
  };

  type NewActor = {
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
    nextSessionId : Nat;
    nextChannelId : Nat;
    nextMessageId : Nat;
    nextDocumentId : Nat;
    nextImageId : Nat;
    nextFileId : Nat;
    nextCommentId : Nat;
    nextStickerId : Nat;
    communityHub : CommunityHub;
    communityPosts : Map.Map<Text, List.List<CommunityPost>>;
    tabOrders : Map.Map<Text, CommunityTabOrder>;
    tabPermissions : Map.Map<Text, CommunityTabPermissions>;
  };

  public func run(old : OldActor) : NewActor {
    let comments = Map.empty<Nat, DocumentComment>();
    let communities = Map.empty<Text, Community>();
    let posts = Map.empty<Text, List.List<CommunityPost>>();
    let tabOrders = Map.empty<Text, CommunityTabOrder>();
    let tabPermissions = Map.empty<Text, CommunityTabPermissions>();

    let communityHub = { communities };

    { old with comments; communityHub; communityPosts = posts; tabOrders; tabPermissions };
  };
};
