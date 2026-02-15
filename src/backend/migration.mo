import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  // Original user profile type without profile pictures.
  type OldUserProfile = {
    name : Text;
  };

  // Original actor type with old user profiles
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New user profile type with optional profile picture
  type NewUserProfile = {
    name : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  // New actor type with updated user profiles
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      userProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
        func(_id, oldProf) {
          { oldProf with profilePicture = null };
        }
      )
    };
  };
};
