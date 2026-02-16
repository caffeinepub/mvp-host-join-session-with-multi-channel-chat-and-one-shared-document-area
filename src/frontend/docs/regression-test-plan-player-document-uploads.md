# Regression Test Plan: Player Document Uploads

## Purpose
Verify that file and image uploads work correctly for Player Documents (both private and shared) without breaking existing Session Document upload functionality.

## Preconditions
- User must be logged in with Internet Identity
- User must have joined or created a session

## Test Cases

### Test 1: Private Player Document - Image Upload
**Steps:**
1. Navigate to Player Documents section
2. Create a new player document with "Private Document" toggle ON
3. Open the newly created document
4. Click "Upload image" button
5. Select a valid image file (jpg, png, gif, or webp, under 10MB)
6. Provide an optional title in the dialog
7. Click "Upload" in the dialog

**Expected Results:**
- No "Document not found for file upload" error appears
- Upload progress indicator shows during upload
- Image marker `[FILE:id:filename.ext]` is inserted into document content
- Image appears in the "Images" gallery section below the editor
- Image can be downloaded via the direct URL
- Preview mode renders the image inline at the marker position

### Test 2: Private Player Document - File Upload
**Steps:**
1. Open the same private player document from Test 1
2. Click "Upload file" button
3. Select a valid non-image file (pdf, txt, or md, under 10MB)
4. Wait for upload to complete

**Expected Results:**
- No error alert appears
- File marker `[FILE:id:filename.ext]` is inserted into document content
- File appears in the "File Attachments" section below the editor
- File can be downloaded via the download button
- Preview mode renders the file as a downloadable attachment

### Test 3: Shared Player Document - Image Upload
**Steps:**
1. Create a new player document with "Private Document" toggle OFF (shared)
2. Open the document
3. Upload an image following Test 1 steps 4-7

**Expected Results:**
- Same as Test 1 expected results
- Other session members can see the document and uploaded image

### Test 4: Session/Shared Document - Image Upload (Regression Check)
**Steps:**
1. Navigate to Documents section (not Player Documents)
2. Create or open a session document (host only)
3. Click "Upload image" button
4. Upload an image following Test 1 steps 5-7

**Expected Results:**
- Upload works exactly as before (no regression)
- Image marker is inserted and image appears in gallery
- Preview mode renders correctly

### Test 5: Upload Button Disabled State
**Steps:**
1. Navigate to Player Documents
2. Click on a player document to open it
3. Immediately try to click "Upload image" or "Upload file" before the document fully loads

**Expected Results:**
- Upload buttons are disabled (grayed out) until document is fully loaded
- No backend calls are made while buttons are disabled
- Once document loads, buttons become enabled

### Test 6: Error Handling - Invalid File
**Steps:**
1. Open a player document
2. Try to upload a file with unsupported extension (e.g., .exe, .zip)

**Expected Results:**
- Clear error message appears: "Unsupported file type. Allowed: jpg, jpeg, png, gif, webp, pdf, txt, md"
- No backend call is made
- Document remains editable

### Test 7: Error Handling - File Too Large
**Steps:**
1. Open a player document
2. Try to upload a file larger than 10MB

**Expected Results:**
- Clear error message appears: "File is too large. Maximum size is 10MB."
- No backend call is made

## Notes
- All tests should be performed in both light and dark mode
- Verify that the marker format `[FILE:id:filename]` remains unchanged
- Ensure comments section continues to work after uploads
- Check that save functionality works after inserting file markers
</markdown>
