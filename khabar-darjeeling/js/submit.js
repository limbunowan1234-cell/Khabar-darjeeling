try {
    // 5MB limit check
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        throw new Error('Image too large. Max 5MB allowed.');
    }

    if (imageFile) {
        submitBtn.textContent = 'Uploading image...';
        console.log('Bucket ID:', window.APPWRITE_BUCKET_ID);
        console.log('File size:', imageFile.size);
        
        const file = await window.storage.createFile(
            window.APPWRITE_BUCKET_ID,
            ID.unique(),
            imageFile
        ).catch(err => {
            console.error('RAW UPLOAD ERROR:', err);
            console.error('Error type:', err.type);
            console.error('Error code:', err.code);
            console.error('Error response:', err.response);
            throw err;
        });
        
        console.log('Upload success! File ID:', file.$id);
        imageUrl = window.storage.getFileView(window.APPWRITE_BUCKET_ID, file.$id);
    }

    submitBtn.textContent = 'Saving article...';

    await window.database.createDocument(
        window.APPWRITE_DB_ID,
        window.APPWRITE_COLLECTION_ID,
        ID.unique(),
        {
            title: title,
            content: content,
            category: category,
            location: location,
            authorName: authorName,
            imageUrl: imageUrl,
            status: 'pending',
            submittedAt: new Date().toISOString()
        }
    );

    document.getElementById('newsForm').style.display = 'none';
    successMessage.style.display = 'block';

} catch (error) {
    console.error('FULL ERROR OBJECT:', error);
    errorText.textContent = `Error: ${error.message} | Code: ${error.code || 'unknown'}`;
    errorMessage.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit News';
}