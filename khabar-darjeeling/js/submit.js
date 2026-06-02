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
    
    // Get all REQUIRED fields from your form
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value.trim();
    const content = document.getElementById('content').value.trim();
    const authorName = document.getElementById('authorName').value.trim();
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
        
        // Only attributes that exist in your Appwrite collection
        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            ID.unique(),
            {
                title: title, // required
                content: content, // required
                category: category, // required
                location: location, // required
                authorName: authorName, // required
                status: 'pending', // required
                submittedAt: new Date().toISOString(), // required
                imageField: imageUrl // optional - uses 'imageField' not 'image'
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