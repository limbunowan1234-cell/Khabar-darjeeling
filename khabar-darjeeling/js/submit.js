// js/submit.js

document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    
    // Reset UI
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    errorMessage.style.display = 'none';
    
    // Get form values
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value.trim();
    const content = document.getElementById('content').value.trim();
    const authorName = document.getElementById('authorName').value.trim();
    const authorEmail = document.getElementById('authorEmail').value.trim();
    const authorPhone = document.getElementById('authorPhone').value.trim();
    const source = document.getElementById('source').value.trim();
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
        
        // Create document - all required fields included
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
                submittedAt: new Date().toISOString() // Matches Appwrite attribute
            }
        );
        
        // Show success
        document.getElementById('newsForm').style.display = 'none';
        successMessage.style.display = 'block';
        
    } catch (error) {
        console.error('Submit error:', error);
        errorText.textContent = error.message;
        errorMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit News';
    }
});

// Image preview function
document.getElementById('image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
    }
});

function removeImage() {
    document.getElementById('image').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}