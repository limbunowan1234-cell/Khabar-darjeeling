try {
    // 5MB limit check
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        throw new Error('Image too large. Max 5MB allowed.');
    }

    // Explicitly pull Appwrite parameters from window scope
    const storage = window.storage;
    const database = window.databases || window.database; // Handles both naming variants safely
    const appwriteIdService = window.ID;

    if (!storage || !database || !appwriteIdService) {
        throw new Error('Appwrite services failed to initialize globally. Check appwrite.js load order.');
    }

    if (imageFile) {
        submitBtn.textContent = 'Uploading image...';
        console.log('Bucket ID:', window.APPWRITE_BUCKET_ID);
        console.log('File size:', imageFile.size);
        
        // FIX: Added window.ID reference mapping
        const file = await storage.createFile(
            window.APPWRITE_BUCKET_ID,
            appwriteIdService.unique(),
            imageFile
        ).catch(err => {
            console.error('RAW UPLOAD ERROR:', err);
            console.error('Error type:', err.type);
            console.error('Error code:', err.code);
            throw err;
        });
        
        console.log('Upload success! File ID:', file.$id);
        // Generates the public link for storage image
        imageUrl = storage.getFileView(window.APPWRITE_BUCKET_ID, file.$id);
    }

    submitBtn.textContent = 'Saving article...';

    // FIX: Using robust window mappings for unique ID generation
    await database.createDocument(
        window.APPWRITE_DB_ID,
        window.APPWRITE_COLLECTION_ID,
        appwriteIdService.unique(),
        {
            title: title,
            content: content,
            category: category,
            location: location,
            authorName: authorName,
            imageUrl: imageUrl || '', // Prevent empty entries from failing schema validation
            status: 'pending',
            submittedAt: new Date().toISOString()
        }
    );

    document.getElementById('newsForm').style.display = 'none';
    successMessage.style.display = 'block';

} catch (error) {
    console.error('FULL ERROR OBJECT:', error);
    // Safe evaluation to ensure no unhandled null properties hit Eruda
    const errorMsg = error.message || 'Unknown execution error';
    const errorCode = error.code || error.name || 'unknown';
    
    errorText.textContent = `Error: ${errorMsg} | Code: ${errorCode}`;
    errorMessage.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit News';
}
