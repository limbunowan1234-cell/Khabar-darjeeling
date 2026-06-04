// js/submit.js

document.addEventListener('DOMContentLoaded', () => {
    const newsForm = document.getElementById('newsForm');
    const submitBtn = document.getElementById('submitBtn');
    const imageInput = document.getElementById('imageInput');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    if (!newsForm) return;

    // Helper function to extract YouTube ID
    function extractVideoID(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

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
        const content = document.getElementById('content').value;
        
        // New optional field capture
        const ytLinkInput = document.getElementById('ytLink');
        const ytLink = ytLinkInput ? ytLinkInput.value : '';
        
        const authorNameElement = document.getElementById('authorName');
        const authorName = authorNameElement ? authorNameElement.value : 'Anonymous'; 
        
        const imageFile = imageInput ? imageInput.files[0] : null;

        let uploadedImageId = null; 

        try {
            // 3. Validation
            if (imageFile && imageFile.size > 5 * 1024 * 1024) {
                throw new Error('Image too large. Max 5MB allowed.');
            }

            if (!window.storage || (!window.databases && !window.database) || !window.ID) {
                throw new Error('Appwrite services not initialized.');
            }

            // 4. Image Upload Logic
            if (imageFile) {
                submitBtn.textContent = 'Uploading image...';
                
                const file = await window.storage.createFile(
                    window.APPWRITE_BUCKET_ID, 
                    window.ID.unique(),
                    imageFile
                );
                uploadedImageId = file.$id;
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
                submittedAt: new Date().toISOString(),
                imageFileId: uploadedImageId || null,
                youtube_id: extractVideoID(ytLink) // Extracts ID or returns null
            };

            await activeDatabase.createDocument(
                window.APPWRITE_DB_ID,
                window.APPWRITE_COLLECTION_ID,
                window.ID.unique(),
                articlePayload
            );

            // 6. Success Handling
            newsForm.reset();
            newsForm.style.display = 'none';
            successMessage.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Submission failed:', error);
            errorText.textContent = error.message || 'An unexpected error occurred.';
            errorMessage.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit News';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});
