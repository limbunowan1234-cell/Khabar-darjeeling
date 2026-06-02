document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Get form values
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const content = document.getElementById('content').value;
    const authorName = document.getElementById('authorName').value;
    const authorEmail = document.getElementById('authorEmail').value;
    const authorPhone = document.getElementById('authorPhone').value;
    const source = document.getElementById('source').value;
    const imageFile = document.getElementById('image').files[0];
    
    let imageUrl = ''; // Default empty if no image
    
    try {
        // Only upload image if user selected one
        if (imageFile) {
            submitBtn.textContent = 'Uploading image...';
            
            const file = await storage.createFile(
                APPWRITE_BUCKET_ID,
                ID.unique(),
                imageFile
            );
            imageUrl = storage.getFileView(APPWRITE_BUCKET_ID, file.$id);
        }
        
        submitBtn.textContent = 'Saving article...';
        
        // Create document - imageUrl will be '' if no image
        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            ID.unique(),
            {
                title: title,
                category: category,
                location: location,
                content: content,
                authorName: authorName,
                authorEmail: authorEmail,
                authorPhone: authorPhone,
                source: source,
                image: imageUrl, // Empty string if no image
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        );
        
        // Show success
        document.getElementById('newsForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
    } catch (error) {
        console.error('Submit error:', error);
        document.getElementById('errorText').textContent = error.message;
        document.getElementById('errorMessage').style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit News';
    }
});

// Image preview function
document.getElementById('image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

function removeImage() {
    document.getElementById('image').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}