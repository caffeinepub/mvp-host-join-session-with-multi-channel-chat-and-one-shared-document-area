import Map "mo:core/Map";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  // Old types
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

  type MessageOld = {
    id : Nat;
    channelId : Nat;
    author : Text;
    content : Text;
    timestamp : Int;
    image : ?Storage.ExternalBlob;
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

  type PlayerDocumentMetadata = {
    id : Nat;
    sessionId : Nat;
    owner : Principal;
    name : Text;
    createdBy : Principal;
    lastModified : Int;
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

  type SessionCreateRequest = {
    name : Text;
    password : ?Text;
    hostNickname : Text;
  };

  type JoinSessionRequest = {
    sessionId : Nat;
    nickname : Text;
    password : ?Text;
  };

  type StandardResponse = {
    #ok : Text;
    #error : Text;
  };

  type UploadFileRequest = {
    documentId : Nat;
    file : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
    size : Nat;
  };

  type UploadDocumentFileResponse = {
    #ok : Nat;
    #error : Text;
  };

  type CreateDocumentResponse = {
    #ok : Nat;
    #error : Text;
  };

  type CreatePlayerDocumentResponse = {
    #ok : Nat;
    #error : Text;
  };

  type CreateImageResponse = {
    #ok : Nat;
    #error : Text;
  };

  type AddImageToDocumentResponse = {
    #ok : Nat;
    #error : Text;
  };

  type SessionExport = {
    session : Session;
    channels : [Channel];
    messages : [MessageOld];
    documents : [Document];
    playerDocuments : [PlayerDocument];
    images : [ImageReference];
    documentFiles : [DocumentFileReference];
    turnOrder : ?TurnOrder;
  };

  type DocumentMetadata = {
    #session : Document;
    #player : PlayerDocument;
  };

  type OldActor = {
    nextSessionId : Nat;
    nextChannelId : Nat;
    nextMessageId : Nat;
    nextDocumentId : Nat;
    nextImageId : Nat;
    nextFileId : Nat;
    nextCommentId : Nat;
    sessions : Map.Map<Nat, Session>;
    messages : Map.Map<Nat, List.List<MessageOld>>;
    documents : Map.Map<Nat, Document>;
    playerDocumentsMap : Map.Map<Nat, PlayerDocument>;
    turnOrders : Map.Map<Nat, TurnOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    imageReferences : Map.Map<Nat, ImageReference>;
    documentFileReferences : Map.Map<Nat, DocumentFileReference>;
    comments : Map.Map<Nat, DocumentComment>;
  };

  // New types for migration
  type MessageNew = {
    id : Nat;
    channelId : Nat;
    author : Text;
    content : Text;
    timestamp : Int;
    image : ?Storage.ExternalBlob;
    replyToId : ?Nat;
  };

  type NewActor = {
    nextSessionId : Nat;
    nextChannelId : Nat;
    nextMessageId : Nat;
    nextDocumentId : Nat;
    nextImageId : Nat;
    nextFileId : Nat;
    nextCommentId : Nat;
    sessions : Map.Map<Nat, Session>;
    messages : Map.Map<Nat, List.List<MessageNew>>;
    documents : Map.Map<Nat, Document>;
    playerDocumentsMap : Map.Map<Nat, PlayerDocument>;
    turnOrders : Map.Map<Nat, TurnOrder>;
    userProfiles : Map.Map<Principal, UserProfile>;
    imageReferences : Map.Map<Nat, ImageReference>;
    documentFileReferences : Map.Map<Nat, DocumentFileReference>;
    comments : Map.Map<Nat, DocumentComment>;
  };

  public func run(old : OldActor) : NewActor {
    let migratedMessages = old.messages.map<Nat, List.List<MessageOld>, List.List<MessageNew>>(
      func(_sessionId, oldMsgList) {
        oldMsgList.map<MessageOld, MessageNew>(
          func(oldMsg) {
            { oldMsg with replyToId = null : ?Nat };
          }
        );
      }
    );

    {
      old with
      messages = migratedMessages;
    };
  };
};
