import Map "mo:core/Map";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
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

  // ==== Types ====

  public type UserProfile = {
    name : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type Channel = {
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

  // ==== Component Integration ====
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ==== State Vars ====
  var nextSessionId : Nat = 1;
  var nextChannelId : Nat = 1;
  var nextMessageId : Nat = 1;
  var nextDocumentId : Nat = 1;
  var nextImageId : Nat = 1;
  var nextFileId : Nat = 1;

  let sessions = Map.empty<Nat, Session>();
  let messages = Map.empty<Nat, List.List<Message>>();
  let documents = Map.empty<Nat, Document>();
  let playerDocumentsMap = Map.empty<Nat, PlayerDocument>();
  let turnOrders = Map.empty<Nat, TurnOrder>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let imageReferences = Map.empty<Nat, ImageReference>();
  let documentFileReferences = Map.empty<Nat, DocumentFileReference>();

  // ==== Helper Functions ====

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

  // ==== User Profile API ====

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

  // ==== Session Management API ====

  public shared ({ caller }) func createSession(request : SessionCreateRequest) : async Session {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sessions");
    };

    let passwordHash = switch (request.password) {
      case (null) { null };
      case (?pwd) { ?hashPassword(pwd) };
    };

    let defaultChannel : Channel = {
      id = nextChannelId;
      name = "Main";
      createdBy = caller;
    };
    nextChannelId += 1;

    let hostMember : SessionMember = {
      id = caller;
      nickname = request.hostNickname;
      joinedAt = Time.now();
    };

    let session : Session = {
      id = nextSessionId;
      name = request.name;
      host = caller;
      passwordHash;
      members = [hostMember];
      channels = [defaultChannel];
      createdAt = Time.now();
      lastActive = Time.now();
    };

    sessions.add(nextSessionId, session);
    messages.add(nextSessionId, List.empty<Message>());

    nextSessionId += 1;
    session;
  };

  public shared ({ caller }) func joinSession(request : JoinSessionRequest) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join sessions");
    };

    switch (sessions.get(request.sessionId)) {
      case (null) { #error("Session not found") };
      case (?session) {
        // Check if already a member
        if (isSessionMember(request.sessionId, caller)) {
          return #error("Already a member of this session");
        };

        // Verify password if required
        switch (session.passwordHash) {
          case (?hash) {
            switch (request.password) {
              case (null) { return #error("Password required") };
              case (?pwd) {
                if (not verifyPassword(pwd, hash)) {
                  return #error("Invalid password");
                };
              };
            };
          };
          case (null) {};
        };

        // Add member
        let newMember : SessionMember = {
          id = caller;
          nickname = request.nickname;
          joinedAt = Time.now();
        };

        let updatedMembers = session.members.concat([newMember]);
        let updatedSession = {
          session with
          members = updatedMembers;
          lastActive = Time.now();
        };

        sessions.add(request.sessionId, updatedSession);
        #ok("Joined session successfully");
      };
    };
  };

  public query ({ caller }) func getSession(sessionId : Nat) : async ?Session {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sessions");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can view session details");
    };

    sessions.get(sessionId);
  };

  public query ({ caller }) func listSessions() : async [Session] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list sessions");
    };

    sessions.values().toArray();
  };

  // ==== Channel Management API ====

  public shared ({ caller }) func createChannel(sessionId : Nat, name : Text) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create channels");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can create channels");
    };

    switch (sessions.get(sessionId)) {
      case (null) { #error("Session not found") };
      case (?session) {
        let newChannel : Channel = {
          id = nextChannelId;
          name;
          createdBy = caller;
        };
        nextChannelId += 1;

        let updatedChannels = session.channels.concat([newChannel]);
        let updatedSession = {
          session with
          channels = updatedChannels;
        };

        sessions.add(sessionId, updatedSession);
        updateSessionActivity(sessionId);
        #ok("Channel created");
      };
    };
  };

  public shared ({ caller }) func renameChannel(sessionId : Nat, channelId : Nat, newName : Text) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rename channels");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can rename channels");
    };

    switch (sessions.get(sessionId)) {
      case (null) { #error("Session not found") };
      case (?session) {
        let updatedChannels = session.channels.map(
          func(ch) {
            if (ch.id == channelId) {
              { ch with name = newName };
            } else {
              ch;
            };
          }
        );

        let updatedSession = {
          session with
          channels = updatedChannels;
        };

        sessions.add(sessionId, updatedSession);
        updateSessionActivity(sessionId);
        #ok("Channel renamed");
      };
    };
  };

  public shared ({ caller }) func deleteChannel(sessionId : Nat, channelId : Nat) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete channels");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can delete channels");
    };

    switch (sessions.get(sessionId)) {
      case (null) { #error("Session not found") };
      case (?session) {
        let updatedChannels = session.channels.filter(
          func(ch) { ch.id != channelId }
        );

        if (updatedChannels.size() == 0) {
          return #error("Cannot delete the last channel");
        };

        let updatedSession = {
          session with
          channels = updatedChannels;
        };

        sessions.add(sessionId, updatedSession);
        updateSessionActivity(sessionId);
        #ok("Channel deleted");
      };
    };
  };

  public query ({ caller }) func getChannels(sessionId : Nat) : async [Channel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view channels");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can view channels");
    };

    switch (sessions.get(sessionId)) {
      case (null) { [] };
      case (?session) { session.channels };
    };
  };

  // ==== Message API ====

  public shared ({ caller }) func postMessage(sessionId : Nat, channelId : Nat, content : Text) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post messages");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can post messages");
    };

    switch (getMemberNickname(sessionId, caller)) {
      case (null) { #error("Member not found") };
      case (?nickname) {
        let message : Message = {
          id = nextMessageId;
          channelId;
          author = nickname;
          content;
          timestamp = Time.now();
        };
        nextMessageId += 1;

        switch (messages.get(sessionId)) {
          case (null) {
            messages.add(sessionId, List.singleton<Message>(message));
          };
          case (?msgList) {
            msgList.add(message);
          };
        };

        updateSessionActivity(sessionId);
        #ok("Message posted");
      };
    };
  };

  public query ({ caller }) func getMessages(sessionId : Nat, channelId : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can view messages");
    };

    switch (messages.get(sessionId)) {
      case (null) { [] };
      case (?msgList) {
        let filtered = msgList.filter(
          func(m) { m.channelId == channelId }
        );
        filtered.toArray();
      };
    };
  };

  // ==== Document Management API ====

  public shared ({ caller }) func createDocument(sessionId : Nat, name : Text, content : Text) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create documents");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can create documents");
    };

    let doc : Document = {
      id = nextDocumentId;
      sessionId;
      name;
      content;
      revision = 1;
      locked = false;
      createdBy = caller;
      lastModified = Time.now();
    };
    nextDocumentId += 1;

    documents.add(doc.id, doc);
    updateSessionActivity(sessionId);
    #ok("Document created with ID: " # doc.id.toText());
  };

  public shared ({ caller }) func renameDocument(documentId : Nat, newName : Text) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rename documents");
    };

    switch (documents.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not isSessionHost(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only the session host can rename documents");
        };

        let updated = {
          doc with
          name = newName;
          lastModified = Time.now();
        };
        documents.add(documentId, updated);
        updateSessionActivity(doc.sessionId);
        #ok("Document renamed");
      };
    };
  };

  public shared ({ caller }) func lockDocument(documentId : Nat) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can lock documents");
    };

    switch (documents.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not isSessionHost(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only the session host can lock documents");
        };

        let updated = {
          doc with
          locked = true;
          lastModified = Time.now();
        };
        documents.add(documentId, updated);
        #ok("Document locked");
      };
    };
  };

  public shared ({ caller }) func unlockDocument(documentId : Nat) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock documents");
    };

    switch (documents.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not isSessionHost(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only the session host can unlock documents");
        };

        let updated = {
          doc with
          locked = false;
          lastModified = Time.now();
        };
        documents.add(documentId, updated);
        #ok("Document unlocked");
      };
    };
  };

  public shared ({ caller }) func deleteDocument(documentId : Nat) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete documents");
    };

    switch (documents.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not isSessionHost(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only the session host can delete documents");
        };

        documents.remove(documentId);
        updateSessionActivity(doc.sessionId);
        #ok("Document deleted");
      };
    };
  };

  public shared ({ caller }) func editDocument(documentId : Nat, newContent : Text) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit documents");
    };

    switch (documents.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not isSessionMember(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only session members can edit documents");
        };

        if (doc.locked) {
          return #error("Document is locked");
        };

        let updated = {
          doc with
          content = newContent;
          revision = doc.revision + 1;
          lastModified = Time.now();
        };
        documents.add(documentId, updated);
        updateSessionActivity(doc.sessionId);
        #ok("Document updated to revision " # updated.revision.toText());
      };
    };
  };

  public query ({ caller }) func getDocument(documentId : Nat) : async ?Document {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view documents");
    };

    switch (documents.get(documentId)) {
      case (null) { null };
      case (?doc) {
        if (not isSessionMember(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only session members can view documents");
        };
        ?doc;
      };
    };
  };

  public query ({ caller }) func listDocuments(sessionId : Nat) : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list documents");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can list documents");
    };

    let filtered = documents.values().filter(
      func(doc) { doc.sessionId == sessionId }
    );
    filtered.toArray();
  };

  public shared ({ caller }) func uploadDocumentFile(request : UploadFileRequest) : async StandardResponse {
    // Validate user authorization
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #error("Unauthorized: Only users can upload files");
    };

    // Validate document existence first
    let doc = switch (documents.get(request.documentId)) {
      case (null) {
        return #error("Document not found for file upload");
      };
      case (?d) { d };
    };

    // Validate is session host for the specific document's session
    if (not isSessionHost(doc.sessionId, caller)) {
      return #error("Unauthorized: Only session hosts can upload files");
    };

    // File type and size validation (already checked in frontend for <=10MB)
    if (request.size > 10_000_000) {
      return #error("File size must not exceed 10MB");
    };

    let newFileReference : DocumentFileReference = {
      id = nextFileId;
      documentId = request.documentId;
      file = request.file;
      filename = request.filename;
      mimeType = request.mimeType;
      size = request.size;
      createdBy = caller;
      lastModified = Time.now();
    };
    nextFileId += 1;

    documentFileReferences.add(newFileReference.id, newFileReference);
    #ok("File uploaded successfully");
  };

  public query ({ caller }) func listDocumentFiles(documentId : Nat) : async [DocumentFileReference] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return [];
    };

    let docSessionId = switch (documents.get(documentId)) {
      case (null) { return [] };
      case (?doc) { doc.sessionId };
    };

    if (not isSessionMember(docSessionId, caller)) {
      return [];
    };

    let filteredFiles = documentFileReferences.values().filter(
      func(file) { file.documentId == documentId }
    );
    filteredFiles.toArray();
  };

  public query ({ caller }) func getDocumentFileReference(fileId : Nat) : async ?DocumentFileReference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };

    return documentFileReferences.get(fileId);
  };

  public query ({ caller }) func getDocumentFileBlob(fileId : Nat) : async ?Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };

    let fileRef = switch (documentFileReferences.get(fileId)) {
      case (null) { return null };
      case (?ref) { ref };
    };

    let docSessionId = switch (documents.get(fileRef.documentId)) {
      case (null) { return null };
      case (?doc) { doc.sessionId };
    };

    if (not isSessionMember(docSessionId, caller)) {
      return null;
    };

    ?fileRef.file;
  };

  // ==== RPG Utilities: Dice Roller ====

  func parseDicePattern(pattern : Text) : ?(Nat, Nat, Int) {
    // Parse patterns like "d20", "2d6+3", "d20-1"
    let trimmed = pattern.trim(#text " ");

    var numDice : Nat = 1;
    var diceSize : Nat = 0;
    var modifier : Int = 0;

    // Simple parser
    let chars = trimmed.chars();
    var buffer = "";
    var stage = 0; // 0=numDice, 1=diceSize, 2=modifier

    for (c in chars) {
      if (c == 'd' or c == 'D') {
        if (buffer.size() > 0) {
          switch (Int.fromText(buffer)) {
            case (?n) { numDice := Int.abs(n) };
            case (null) {};
          };
        };
        buffer := "";
        stage := 1;
      } else if (c == '+' or c == '-') {
        if (stage == 1 and buffer.size() > 0) {
          switch (Int.fromText(buffer)) {
            case (?n) { diceSize := Int.abs(n) };
            case (null) {};
          };
        };
        buffer := Text.fromChar(c);
        stage := 2;
      } else {
        buffer #= Text.fromChar(c);
      };
    };

    // Process final buffer
    if (stage == 1 and buffer.size() > 0) {
      switch (Int.fromText(buffer)) {
        case (?n) { diceSize := Int.abs(n) };
        case (null) {};
      };
    } else if (stage == 2 and buffer.size() > 0) {
      switch (Int.fromText(buffer)) {
        case (?n) { modifier := n };
        case (null) {};
      };
    };

    if (diceSize > 0 and numDice > 0 and numDice <= 100) {
      ?(numDice, diceSize, modifier);
    } else {
      null;
    };
  };

  func rollDice(numDice : Nat, diceSize : Nat) : [Nat] {
    // Simple pseudo-random using timestamp
    let seed = Int.abs(Time.now());
    Array.tabulate<Nat>(
      numDice,
      func(i) {
        let roll = (seed + i * 7919) % diceSize + 1;
        Int.abs(roll);
      },
    );
  };

  public shared ({ caller }) func roll(sessionId : Nat, pattern : Text) : async DiceRollResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can roll dice");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can roll dice");
    };

    switch (parseDicePattern(pattern)) {
      case (null) {
        Runtime.trap("Invalid dice pattern. Use format like 'd20', '2d6+3', etc.");
      };
      case (?(numDice, diceSize, modifier)) {
        let rolls = rollDice(numDice, diceSize);
        var sum = 0;
        for (roll in rolls.vals()) {
          sum += roll;
        };
        let total = sum + modifier;

        updateSessionActivity(sessionId);

        {
          pattern;
          rolls;
          total;
          modifier;
        };
      };
    };
  };

  // ==== RPG Utilities: Turn Tracker ====

  public shared ({ caller }) func setTurnOrder(sessionId : Nat, order : [Text]) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set turn order");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can set turn order");
    };

    let turnOrder : TurnOrder = {
      sessionId;
      order;
      currentIndex = 0;
    };

    turnOrders.add(sessionId, turnOrder);
    updateSessionActivity(sessionId);
    #ok("Turn order set");
  };

  public shared ({ caller }) func nextTurn(sessionId : Nat) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can advance turns");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can advance turns");
    };

    switch (turnOrders.get(sessionId)) {
      case (null) { #error("No turn order set") };
      case (?turnOrder) {
        let nextIndex = (turnOrder.currentIndex + 1) % turnOrder.order.size();
        let updated = {
          turnOrder with
          currentIndex = nextIndex;
        };
        turnOrders.add(sessionId, updated);
        updateSessionActivity(sessionId);
        #ok("Advanced to next turn");
      };
    };
  };

  public query ({ caller }) func getTurnOrder(sessionId : Nat) : async ?TurnOrder {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view turn order");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can view turn order");
    };

    turnOrders.get(sessionId);
  };

  // ==== Inline Images and Document Enhancements ====

  public shared ({ caller }) func addImageToDocument(sessionId : Nat, documentId : Nat, fileId : Text, caption : Text, position : Int, size : Int) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add images");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can add images");
    };

    switch (documents.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        // Verify document belongs to the session
        if (doc.sessionId != sessionId) {
          Runtime.trap("Unauthorized: Document does not belong to this session");
        };

        let image : ImageReference = {
          id = nextImageId;
          documentId;
          fileId;
          caption;
          position;
          size;
          createdBy = caller;
          lastModified = Time.now();
        };
        nextImageId += 1;

        imageReferences.add(image.id, image);
        #ok("Image added to document");
      };
    };
  };

  public query ({ caller }) func getImageReferences(documentId : Nat) : async [ImageReference] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view images");
    };

    switch (documents.get(documentId)) {
      case (null) { [] };
      case (?doc) {
        if (not isSessionMember(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only session members can view images");
        };

        let filtered = imageReferences.values().filter(
          func(img) { img.documentId == documentId }
        );
        filtered.toArray();
      };
    };
  };

  public query ({ caller }) func getDocumentWithImages(documentId : Nat) : async ?DocumentWithImages {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view documents");
    };

    switch (documents.get(documentId)) {
      case (null) { null };
      case (?doc) {
        if (not isSessionMember(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only session members can view documents");
        };

        let images = imageReferences.values().filter(
          func(img) { img.documentId == documentId }
        );
        ?{
          doc with
          images = images.toArray();
        };
      };
    };
  };

  // ==== Player Documents ====

  public shared ({ caller }) func createPlayerDocument(sessionId : Nat, name : Text, content : Text, isPrivate : Bool) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create documents");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can create player documents");
    };

    let doc : PlayerDocument = {
      id = nextDocumentId;
      sessionId;
      owner = caller;
      name;
      content;
      createdBy = caller;
      lastModified = Time.now();
      images = [];
      isPrivate;
    };
    nextDocumentId += 1;

    playerDocumentsMap.add(doc.id, doc);
    updateSessionActivity(sessionId);
    #ok("Player document created with ID: " # doc.id.toText());
  };

  public shared ({ caller }) func renamePlayerDocument(documentId : Nat, newName : Text) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rename documents");
    };

    switch (playerDocumentsMap.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not Principal.equal(doc.owner, caller)) {
          Runtime.trap("Unauthorized: Only the owner can rename this document");
        };

        let updated = {
          doc with
          name = newName;
          lastModified = Time.now();
        };
        playerDocumentsMap.add(documentId, updated);
        updateSessionActivity(doc.sessionId);
        #ok("Player document renamed");
      };
    };
  };

  public shared ({ caller }) func editPlayerDocument(documentId : Nat, newContent : Text) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit documents");
    };

    switch (playerDocumentsMap.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not Principal.equal(doc.owner, caller)) {
          Runtime.trap("Unauthorized: Only the owner can edit this document");
        };

        let updated = {
          doc with
          content = newContent;
          lastModified = Time.now();
        };
        playerDocumentsMap.add(documentId, updated);
        updateSessionActivity(doc.sessionId);
        #ok("Player document updated");
      };
    };
  };

  public shared ({ caller }) func deletePlayerDocument(documentId : Nat) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete documents");
    };

    switch (playerDocumentsMap.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not Principal.equal(doc.owner, caller)) {
          Runtime.trap("Unauthorized: Only the owner can delete this document");
        };

        playerDocumentsMap.remove(documentId);
        updateSessionActivity(doc.sessionId);
        #ok("Player document deleted");
      };
    };
  };

  public shared ({ caller }) func setPlayerDocumentVisibility(documentId : Nat, isPrivate : Bool) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can change visibility");
    };

    switch (playerDocumentsMap.get(documentId)) {
      case (null) { #error("Document not found") };
      case (?doc) {
        if (not Principal.equal(doc.owner, caller)) {
          Runtime.trap("Unauthorized: Only the owner can change visibility");
        };

        let updated = {
          doc with
          isPrivate;
          lastModified = Time.now();
        };
        playerDocumentsMap.add(documentId, updated);
        #ok("Visibility updated");
      };
    };
  };

  public query ({ caller }) func getPlayerDocument(documentId : Nat) : async ?PlayerDocument {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view player documents");
    };

    switch (playerDocumentsMap.get(documentId)) {
      case (null) { null };
      case (?doc) {
        // Owner can always see their document
        if (Principal.equal(doc.owner, caller)) {
          return ?doc;
        };

        // Private documents: no access to content for non-owners
        if (doc.isPrivate) {
          return null;
        };

        // Public documents: only session members can see
        if (not isSessionMember(doc.sessionId, caller)) {
          Runtime.trap("Unauthorized: Only session members can view player documents");
        };

        ?doc;
      };
    };
  };

  public query ({ caller }) func listPlayerDocuments(sessionId : Nat) : async [PlayerDocument] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list player documents");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can list player documents");
    };

    let filtered = playerDocumentsMap.values().filter(
      func(doc) {
        if (doc.sessionId != sessionId) {
          return false;
        };

        // Owner sees all their documents
        if (Principal.equal(doc.owner, caller)) {
          return true;
        };

        // Others (including host) only see non-private documents
        not doc.isPrivate;
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func listPlayerDocumentsMetadata(sessionId : Nat) : async [PlayerDocumentMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view document metadata");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can view all document metadata");
    };

    let filtered = playerDocumentsMap.values().filter(
      func(doc) { doc.sessionId == sessionId }
    );

    filtered.map(
      func(doc) : PlayerDocumentMetadata {
        {
          id = doc.id;
          sessionId = doc.sessionId;
          owner = doc.owner;
          name = doc.name;
          createdBy = doc.createdBy;
          lastModified = doc.lastModified;
          isPrivate = doc.isPrivate;
        };
      }
    ).toArray();
  };

  // ==== Session Export/Import ====

  public query ({ caller }) func exportSession(sessionId : Nat) : async ?SessionExport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can export sessions");
    };

    if (not isSessionHost(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only the session host can export sessions");
    };

    switch (sessions.get(sessionId)) {
      case (null) { null };
      case (?session) {
        let sessionMessages = switch (messages.get(sessionId)) {
          case (null) { [] };
          case (?msgList) { msgList.toArray() };
        };

        let sessionDocuments = documents.values().filter(
          func(doc) { doc.sessionId == sessionId }
        ).toArray();

        let sessionPlayerDocuments = playerDocumentsMap.values().filter(
          func(doc) { doc.sessionId == sessionId }
        ).toArray();

        let sessionImages = imageReferences.values().toArray();

        let sessionDocumentFiles = documentFileReferences.values().toArray();

        let sessionTurnOrder = turnOrders.get(sessionId);

        ?{
          session;
          channels = session.channels;
          messages = sessionMessages;
          documents = sessionDocuments;
          playerDocuments = sessionPlayerDocuments;
          images = sessionImages;
          documentFiles = sessionDocumentFiles;
          turnOrder = sessionTurnOrder;
        };
      };
    };
  };

  public shared ({ caller }) func importSession(exportData : SessionExport) : async StandardResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can import sessions");
    };

    if (not Principal.equal(exportData.session.host, caller)) {
      Runtime.trap("Unauthorized: Only the original host can import this session");
    };

    let newSessionId = nextSessionId;
    nextSessionId += 1;

    // Import session with new ID
    let importedSession = {
      exportData.session with
      id = newSessionId;
      lastActive = Time.now();
    };
    sessions.add(newSessionId, importedSession);

    // Import messages
    let msgList = List.empty<Message>();
    for (msg in exportData.messages.vals()) {
      let newMsg = {
        msg with
        id = nextMessageId;
      };
      nextMessageId += 1;
      msgList.add(newMsg);
    };
    messages.add(newSessionId, msgList);

    // Import documents
    for (doc in exportData.documents.vals()) {
      let newDoc = {
        doc with
        id = nextDocumentId;
        sessionId = newSessionId;
      };
      nextDocumentId += 1;
      documents.add(newDoc.id, newDoc);
    };

    // Import player documents
    for (doc in exportData.playerDocuments.vals()) {
      let newDoc = {
        doc with
        id = nextDocumentId;
        sessionId = newSessionId;
      };
      nextDocumentId += 1;
      playerDocumentsMap.add(newDoc.id, newDoc);
    };

    // Import images
    for (img in exportData.images.vals()) {
      let newImg = {
        img with
        id = nextImageId;
      };
      nextImageId += 1;
      imageReferences.add(newImg.id, newImg);
    };

    // Import document files
    for (file in exportData.documentFiles.vals()) {
      let newFile = {
        file with
        id = nextFileId;
      };
      nextFileId += 1;
      documentFileReferences.add(newFile.id, newFile);
    };

    // Import turn order
    switch (exportData.turnOrder) {
      case (null) {};
      case (?turnOrder) {
        let newTurnOrder = {
          turnOrder with
          sessionId = newSessionId;
        };
        turnOrders.add(newSessionId, newTurnOrder);
      };
    };

    #ok("Session imported with ID: " # newSessionId.toText());
  };

  // ==== Image Retrieval and Management ====

  public query ({ caller }) func getImages(sessionId : Nat) : async [ImageReference] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view images");
    };

    if (not isSessionMember(sessionId, caller)) {
      Runtime.trap("Unauthorized: Only session members can view images");
    };

    let sessionDocIds = documents.values().filter(
      func(doc) { doc.sessionId == sessionId }
    ).map(func(doc) { doc.id });

    let filtered = imageReferences.values().filter(
      func(img) {
        sessionDocIds.find(func(docId) { docId == img.documentId }) != null;
      }
    );

    filtered.toArray();
  };
};
