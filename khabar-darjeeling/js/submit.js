/* ==================== NEWS SUBMISSION JAVASCRIPT ==================== */

document.addEventListener('DOMContentLoaded', () => {
    setupFormListeners();
    setupThemeToggle();
    setupImagePreview();
    setupMobileMenu();
});

// Setup Form Listeners
function setupFormListeners() {
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', handleNewsSubmission);
    }
}

// Setup Theme Toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.textContent = isDark ? '☀️' : '🌙';
        });
    }
}

// Setup Image Preview
function setupImagePreview() {
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
    
    // Make upload area clickable
    const uploadArea = document.querySelector('.image-upload');
    if (uploadArea) {
        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            if (e.dataTransfer.files.length > 0) {
                imageInput.files = e.dataTransfer.files;
                handleImagePreview();
            }
        });
    }
}

// Setup Mobile Menu
function setupMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Handle Image Preview
function handleImagePreview() {
    const imageInput = document.getElementById('image');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(imageInput.files[0]);
    }
}

// Remove Image
function removeImage() {
    const imageInput = document.getElementById('image');
    const preview = document.getElementById('imagePreview');
    imageInput.value = '';
    preview.style.display = 'none';
}

// Handle News Submission
async function handleNewsSubmission(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    // Reset messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        // Get form data
        const title = document.getElementById('title').value.trim();
        const category = document.getElementById('category').value;
        const location = document.getElementById('location').value.trim();
        const content = document.getElementById('content').value.trim();
        const authorName = document.getElementById('authorName').value.trim();
        const authorEmail = document.getElementById('authorEmail').value.trim();
        const authorPhone = document.getElementById('authorPhone').value.trim();
        const source = document.getElementById('source').value.trim();
        const imageFile = document.getElementById('image').files[0];
        
        // Validate form
        if (!title || title.length < 10) {
            throw new Error('Title must be at least 10 characters');
        }
        if (!category) {
            throw new Error('Please select a category');
        }
        if (!location) {
            throw new Error('Location is required');
        }
        if (!content || content.length < 50) {
            throw new Error('Content must be at least 50 characters');
        }
        if (!authorName) {
            throw new Error('Author name is required');
        }
        if (!authorEmail || !isValidEmail(authorEmail)) {
            throw new Error('Valid email is required');
        }
        if (!authorPhone) {
            throw new Error('Contact phone is required');
        }
        if (!imageFile) {
            throw new Error('Featured image is required');
        }
        
        // Upload image
        const uploadedImage = await uploadImage(imageFile);
        
        // Create article object
        const article = {
            title,
            category,
            location,
            content,
            authorName,
            authorEmail,
            authorPhone,
            source: source || 'Direct Submission',
            imageFileId: uploadedImage.$id,
            status: ARTICLE_STATUS.PENDING,
            submittedAt: new Date().toISOString(),
            views: 0
        };
        
        // Save to database
        await createArticle(article);
        
        // Show success message
        document.getElementById('newsForm').style.display = 'none';
        successMessage.style.display = 'block';
        
        // Log the submission
        console.log('✓ Article submitted successfully');
        
    } catch (error) {
        console.error('✗ Submission error:', error);
        errorText.textContent = error.message || 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit News';
    }
}

// Email validation
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Character counter for title
document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('title');
    if (titleInput) {
        titleInput.addEventListener('input', () => {
            const remaining = 200 - titleInput.value.length;
            if (remaining < 0) {
                titleInput.value = titleInput.value.substring(0, 200);
            }
        });
    }
});
