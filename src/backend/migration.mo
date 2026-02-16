import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
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

  public type OldSession = {
    id : Nat;
    name : Text;
    host : Principal;
    passwordHash : ?Blob;
    members : [SessionMember];
    channels : [Channel];
    createdAt : Int;
    lastActive : Int;
  };

  public type OldActor = {
    nextSessionId : Nat;
    nextChannelId : Nat;
    nextMessageId : Nat;
    nextDocumentId : Nat;
    nextImageId : Nat;
    nextFileId : Nat;
    sessions : Map.Map<Nat, OldSession>;
  };

  public type NewActor = {
    nextSessionId : Nat;
    nextChannelId : Nat;
    nextMessageId : Nat;
    nextDocumentId : Nat;
    nextImageId : Nat;
    nextFileId : Nat;
    sessions : Map.Map<Nat, Session>;
  };

  public func run(old : OldActor) : NewActor {
    let newSessions = old.sessions.map<Nat, OldSession, Session>(
      func(_id, oldSession) {
        {
          oldSession with
          membersChannels = [];
        };
      }
    );
    {
      old with
      sessions = newSessions;
    };
  };
};
