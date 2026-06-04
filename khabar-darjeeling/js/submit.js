// js/submit.js

document.addEventListener('DOMContentLoaded', () => {
    const newsForm = document.getElementById('newsForm');
    const submitBtn = document.getElementById('submitBtn');
    const imageInput = document.getElementById('imageInput');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    if (!newsForm) return;

    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Reset UI state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        errorMessage.style.display = 'none';

        // 2. Capture Form Data
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const location = document.getElementById('location').value;
        
        // Failsafe in case authorName input isn't present
        const authorNameElement = document.getElementById('authorName');
        const authorName = authorNameElement ? authorNameElement.value : 'Anonymous'; 
        
        const content = document.getElementById('content').value;
        const imageFile = imageInput.files[0];

        let uploadedImageId = null; // Start as pure null to avoid "Text" or empty string glitches

        try {
            // 3. Validation & Appwrite Service Check
            if (imageFile && imageFile.size > 5 * 1024 * 1024) {
                throw new Error('Image too large. Max 5MB allowed.');
            }

            // Verify global Appwrite objects exist
            if (!window.storage || (!window.databases && !window.database) || !window.ID) {
                throw new Error('Appwrite services not initialized. Check appwrite.js.');
            }

            // 4. Image Upload Logic
            if (imageFile) {
                submitBtn.textContent = 'Uploading image...';
                
                const file = await window.storage.createFile(
                    window.APPWRITE_BUCKET_ID, // ensure this is defined in appwrite.js as 'article-image'
                    window.ID.unique(),
                    imageFile
                ).catch(err => {
                    console.error('Storage Error:', err);
                    throw new Error('Image upload failed: ' + (err.message || 'Unknown error'));
                });
                
                // ONLY grab the ID, not the full URL. The frontend will build the URL!
                uploadedImageId = file.$id;
                console.log('Image uploaded successfully. File ID:', uploadedImageId);
            }

            // 5. Save Document to Database
            submitBtn.textContent = 'Saving news...';
            
            const activeDatabase = window.databases || window.database;

            const articlePayload = {
                title: title,
                content: content,
                category: category,
                location: location,
                authorName: authorName,
                status: 'pending',
                submittedAt: new Date().toISOString()
            };

            // SMART FAILSAFE: Explicitly set pure null if no image was uploaded
            if (uploadedImageId) {
                articlePayload.imageFileId = uploadedImageId;
            } else {
                articlePayload.imageFileId = null;
            }

            await activeDatabase.createDocument(
                window.APPWRITE_DB_ID,
                window.APPWRITE_COLLECTION_ID,
                window.ID.unique(),
                articlePayload
            ).catch(err => {
                console.error('Database Error:', err);
                throw new Error('Could not save article: ' + (err.message || 'Database error'));
            });

            // 6. Success Handling
            newsForm.reset();
            newsForm.style.display = 'none';
            successMessage.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Submission failed:', error);
            
            // UI Error Update
            errorText.textContent = error.message || 'An unexpected error occurred.';
            errorMessage.style.display = 'block';
            
            // Reset Button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit News';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});
