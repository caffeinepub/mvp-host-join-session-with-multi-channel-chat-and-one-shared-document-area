import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldMessage = {
    id : Nat;
    channelId : Nat;
    author : Text;
    content : Text;
    timestamp : Int;
    image : ?Storage.ExternalBlob;
    replyToId : ?Nat;
  };

  type OldActor = {
    messages : Map.Map<Nat, List.List<OldMessage>>;
  };

  type NewMessage = {
    id : Nat;
    channelId : Nat;
    author : Text;
    content : Text;
    timestamp : Int;
    image : ?Storage.ExternalBlob;
    gif : ?Text;
    replyToId : ?Nat;
  };

  type NewActor = {
    messages : Map.Map<Nat, List.List<NewMessage>>;
  };

  public func run(old : OldActor) : NewActor {
    let newMessages = old.messages.map<Nat, List.List<OldMessage>, List.List<NewMessage>>(
      func(_sessionId, oldMsgList) {
        oldMsgList.map<OldMessage, NewMessage>(
          func(oldMsg) {
            { oldMsg with gif = null };
          }
        );
      }
    );
    { messages = newMessages };
  };
};
