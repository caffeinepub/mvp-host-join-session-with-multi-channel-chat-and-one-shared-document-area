import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldPlayerDocument = {
    id : Nat;
    sessionId : Nat;
    owner : Principal;
    name : Text;
    content : Text;
    visible : Bool;
    createdBy : Principal;
    lastModified : Int;
    images : [ImageReference];
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
  };

  type OldActor = {
    playerDocumentsMap : Map.Map<Nat, OldPlayerDocument>;
  };

  type NewPlayerDocument = {
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

  type NewActor = {
    playerDocumentsMap : Map.Map<Nat, NewPlayerDocument>;
  };

  public func run(old : OldActor) : NewActor {
    let newPlayerDocumentsMap = old.playerDocumentsMap.map<Nat, OldPlayerDocument, NewPlayerDocument>(
      func(_id, oldDoc) {
        {
          id = oldDoc.id;
          sessionId = oldDoc.sessionId;
          owner = oldDoc.owner;
          name = oldDoc.name;
          content = oldDoc.content;
          createdBy = oldDoc.createdBy;
          lastModified = oldDoc.lastModified;
          images = oldDoc.images;
          isPrivate = not oldDoc.visible;
        };
      }
    );

    { playerDocumentsMap = newPlayerDocumentsMap };
  };
};
