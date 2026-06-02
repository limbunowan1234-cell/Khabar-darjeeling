// js/submit.js - Fixed for Khabar Darjeeling

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
        // 5MB limit check
        if (imageFile && imageFile.size > 5 * 1024 * 1024) {
            throw new Error('Image too large. Max 5MB allowed.');
        }

        if (imageFile) {
            submitBtn.textContent = 'Uploading image...';
            const file = await window.storage.createFile(
                window.APPWRITE_BUCKET_ID,
                ID.unique(),
                imageFile
            );
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
        console.error('Submit error:', error);
        errorText.textContent = error.message;
        errorMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit News';
    }
});

// Image preview functionality
document.getElementById('image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        }; // <-- You were missing this
        reader.readAsDataURL(file); // <-- And this
    } else {
        imagePreview.style.display = 'none'; // <-- And this block
    }
}); // <-- And this