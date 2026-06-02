// js/submit.js - FINAL WORKING VERSION

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