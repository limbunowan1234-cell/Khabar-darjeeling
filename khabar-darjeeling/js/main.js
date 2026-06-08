/* Main homepage JavaScript - with token login + Safari fix */
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT = 'khabardarjeeling';
const ADMIN_EMAIL = 'nowanad@gmail.com';

document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. CHECK LOGIN FIRST (token-based, no cookies) ---
    await checkLoginState();
    
    // --- 2. SAFARI FIX ---
    if ('serviceWorker' in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map(key => caches.delete(key)));
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(()=>{});
            });
        } catch (e) {}
    }

    setupEventListeners();
    setupThemeToggle();
    await loadBreakingNews();
    await loadFeaturedArticle();
    await loadArticles();
    await loadPopularNews();
    setupCategoryLinks();
});

async function checkLoginState() {
    const jwt = localStorage.getItem('kd_jwt');
    const loginBtn = document.getElementById('loginBtn');
    const userActions = document.getElementById('userActions');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!jwt || !loginBtn) return;
    
    try {
        const r = await fetch(`${APPWRITE_ENDPOINT}/account`, {
            headers: {
                'X-Appwrite-Project': APPWRITE_PROJECT,
                'X-Appwrite-JWT': jwt
            }
        });
        if (!r.ok) throw new Error('invalid');
        const user = await r.json();
        
        // Show Post/Admin buttons
        loginBtn.style.display = 'none';
        if (userActions) userActions.style.display = 'flex';
        
        if (user.email?.toLowerCase() === ADMIN_EMAIL && adminBtn) {
            adminBtn.style.display = 'inline-block';
        }
        
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                localStorage.removeItem('kd_jwt');
                localStorage.removeItem('kd_email');
                location.reload();
            };
        }
    } catch (e) {
        localStorage.removeItem('kd_jwt');
    }
}

// ... keep all your existing functions below unchanged ...
function setupEventListeners() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            localStorage.setItem('newsletter_email', email);
            alert('Thank you for subscribing!');
            newsletterForm.reset();
        });
    }
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) loadArticles(1, category);
}

function setupThemeToggle() { /* your existing code */ }
async function loadBreakingNews() { /* your existing code */ }
async function loadFeaturedArticle() { /* your existing code */ }
async function loadArticles(page = 1, category = null) { /* your existing code */ }
function performSearch() { /* your existing code */ }
async function loadPopularNews() { /* your existing code */ }
function setupCategoryLinks() { /* your existing code */ }