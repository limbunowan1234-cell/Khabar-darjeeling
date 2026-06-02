// js/submit.js

document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    errorMessage.style.display = 'none';
    
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value.trim();
    const content = document.getElementById('content').value.trim();
    const source = document.getElementById('source').value.trim();
    const authorName = document.getElementById('authorName').value.trim(); // Added back
    const imageFile = document.getElementById('image').files[0];
    
    let imageUrl = '';
    
    try {
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
        
        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            ID.unique(),
            {
                title: title,
                category: category,
                location: location,
                content: content,
                source: source,
                authorName: authorName, // Added back - required by Appwrite
                image: imageUrl,
                status: 'pending',
                submittedAt: new Date().toISOString()
            }
        );
        
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