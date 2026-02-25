# Regression Test Plan: Player Document Uploads

## Test Environment
- Browser: Chrome/Firefox/Safari
- Device: Desktop and Mobile
- User roles: Host and Player

## Test Cases

### 1. Player Document Creation with Privacy Toggle
**Steps:**
1. Log in as a player
2. Join a session
3. Open player documents dialog
4. Create a new document with "Private" toggle ON
5. Create another document with "Private" toggle OFF

**Expected:**
- Private document visible only to owner and host
- Shared document visible to all session members
- Both documents appear in owner's list

### 2. File Upload to Player Document (Owner)
**Steps:**
1. Create a player document
2. Switch to Edit mode
3. Upload a file (PDF, TXT, etc.)
4. Verify upload button is disabled until document loads
5. Save document

**Expected:**
- Upload button disabled during document load
- File uploads successfully
- File marker appears in content
- File appears in attachments section

### 3. Image Upload to Player Document (Owner)
**Steps:**
1. Create a player document
2. Switch to Edit mode
3. Upload an image with a title
4. Save document
5. Switch to Preview mode

**Expected:**
- Image uploads successfully
- Image appears in gallery section
- Image renders inline in preview at marker position
- Title displays correctly

### 4. Upload Button Disabled States
**Steps:**
1. Open player document editor
2. Observe upload buttons before document loads
3. Wait for document to load
4. Observe upload buttons after load

**Expected:**
- Upload buttons disabled before document loads
- Upload buttons enabled after document loads
- No backend calls made with invalid document IDs

### 5. File Upload Error Handling
**Steps:**
1. Attempt to upload file > 10MB
2. Attempt to upload invalid file type
3. Simulate network error during upload

**Expected:**
- Clear error messages for each scenario
- No partial uploads
- UI remains responsive

### 6. Session Document Uploads (Regression)
**Steps:**
1. Log in as host
2. Create session document
3. Upload files and images
4. Verify all upload functionality works

**Expected:**
- Session document uploads work as before
- No regression in existing functionality
- Host-only upload restrictions maintained

### 7. Player Document Visibility Toggle
**Steps:**
1. Create private player document
2. Toggle visibility to shared
3. Verify other players can see it
4. Toggle back to private
5. Verify other players cannot see it

**Expected:**
- Visibility changes apply immediately
- Host can always see all documents
- Other players see only shared documents

### 8. Mixed Content Preview
**Steps:**
1. Create document with text, images, and files
2. Add file markers throughout text
3. Switch to Preview mode

**Expected:**
- Text renders with line breaks preserved
- Images render inline at marker positions
- Files render as attachment rows at marker positions
- All content displays in correct order

## Regression Checks for Preview Markup

### 9. Line Prefix Markup
**Steps:**
1. Create document with content:
   ```
   [C] This is centered text
   [B] This is big text
   # This is a heading
   -# This is tiny text
   Normal text
   ```
2. Switch to Preview mode

**Expected:**
- `[C]` line displays centered (prefix removed)
- `[B]` line displays larger than normal
- `#` line displays as extra-large heading
- `-#` line displays as extra-small text
- Normal text displays at default size
- All prefixes removed in preview

### 10. Inline Markup (Spoilers)
**Steps:**
1. Create document with: `This is ||hidden text|| and more text`
2. Switch to Preview mode
3. Click/tap on spoiler
4. Use keyboard (Tab + Enter) on another spoiler

**Expected:**
- Spoiler text hidden by default (blacked out)
- Click reveals spoiler text
- Keyboard navigation works (focusable)
- Enter/Space key reveals spoiler
- Non-spoiler text unaffected

### 11. Inline Markup (Underline)
**Steps:**
1. Create document with: `This is __underlined__ text`
2. Create bullet: `- __underlined item__`
3. Switch to Preview mode

**Expected:**
- Only wrapped text is underlined
- Surrounding characters (like `- `) remain intact
- Underline renders correctly in all contexts

### 12. Markup Around File Markers
**Steps:**
1. Create document with:
   ```
   [C] Centered text before image
   [FILE:1:image.jpg]
   [B] Big text after image
   ||spoiler|| and __underline__ near [FILE:2:doc.pdf]
   ```
2. Switch to Preview mode

**Expected:**
- Line prefixes apply to text segments
- File markers render as images/attachments
- Inline markup works in text around file markers
- All markup renders correctly in mixed content

### 13. Session Document Preview Markup
**Steps:**
1. Create session document with all markup types
2. Switch to Preview mode
3. Verify all markup renders

**Expected:**
- All markup features work in session documents
- Same behavior as player documents
- Host-only editing maintained

### 14. Player Document Preview Markup
**Steps:**
1. Create player document with all markup types
2. Switch to Preview mode
3. Share document and view as another player

**Expected:**
- All markup features work in player documents
- Markup renders correctly for all viewers
- Owner-only editing maintained

### 15. Edge Cases
**Steps:**
1. Test empty spoilers: `||||`
2. Test empty underlines: `____`
3. Test nested markup: `||__text__||\` (should not nest)
4. Test incomplete markup: `||incomplete`
5. Test multiple prefixes: `[C] [B] text`

**Expected:**
- Empty markup handled gracefully
- Nested markup not supported (renders literally)
- Incomplete markup renders as plain text
- Only first prefix applies per line

## Notes
- All tests should pass on both desktop and mobile
- Test with both session and player documents
- Verify no backend changes required
- Ensure stored content remains unchanged (markup only in preview)
