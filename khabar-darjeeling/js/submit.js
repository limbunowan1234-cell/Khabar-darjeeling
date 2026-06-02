// js/submit.js - WORKING VERSION

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
    
    try {
        submitBtn.textContent = 'Saving article...';
        
        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            ID.unique(),
            {
                title: title,
                content: content,
                category: category,
                location: location,
                authorName: authorName,
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

// Remove image preview code for now to avoid confusion
document.getElementById('image').style.display = 'none';
document.querySelector('label[for="image"]').style.display = 'none';