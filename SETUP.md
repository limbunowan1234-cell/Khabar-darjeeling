# Khabar Darjeeling - Setup Guide

## Quick Start

### Step 1: Create Appwrite Database

1. Go to https://cloud.appwrite.io
2. Create a new project
3. Create a database:
   - Name: `news_db`
   - ID: `news_db`

4. Create a collection with these attributes:

```
Collection ID: news

Attributes:
- title (String, required, 200 chars)
- category (String, required)
- location (String, required)
- content (String, required, large text)
- authorName (String, required)
- authorEmail (String, required)
- authorPhone (String, required)
- source (String)
- imageFileId (String, required)
- status (String, required) - enum: pending, approved, rejected
- submittedAt (DateTime)
- publishedAt (DateTime)
- views (Integer, default: 0)
- publisherNote (String)
```

5. Create a storage bucket:
   - Name: `news-images`
   - ID: `news-images`
   - Max file size: 5242880 (5MB)
   - Allowed MIME types: image/jpeg, image/png, image/webp

### Step 2: Configure Application

1. Open `js/config.js`
2. Update these values:

```javascript
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'your_project_id_here';
const APPWRITE_API_KEY = 'your_api_key_here';
```

3. Open `js/admin.js` and update admin credentials:

```javascript
const ADMIN_EMAIL = 'your-email@example.com';
const ADMIN_PASSWORD = 'your-secure-password';
```

### Step 3: Deploy

Choose one deployment option:

#### Using Vercel (Recommended)
```bash
npm install -g vercel
cd your-project-folder
vercel
```

#### Using Netlify
```bash
npm install -g netlify-cli
cd your-project-folder
netlify deploy --prod
```

#### Using GitHub Pages
1. Push files to GitHub repository
2. Go to Settings → Pages
3. Select main branch
4. Save

#### Manual Hosting
1. Upload all files to your web server
2. Ensure HTTPS is enabled
3. Point domain to hosting

### Step 4: Connect Domain

1. Update your domain DNS to point to your hosting
2. Wait for DNS propagation (can take 24-48 hours)
3. Update `SITE_CONFIG.url` in `js/config.js`

## Testing

### Test News Submission
1. Go to `/submit.html`
2. Fill the form
3. Upload an image
4. Submit
5. Check admin panel for pending articles

### Test Admin Dashboard
1. Go to `/admin.html`
2. Login with your credentials
3. Approve/reject articles
4. Check homepage for published articles

### Test SEO
1. Right-click on article page
2. Inspect → head section
3. Verify meta tags and schema markup
4. Submit sitemap.xml to Google Search Console

## Important Notes

⚠️ **Security**
- Change admin password in production
- Keep API keys secret (use environment variables if possible)
- Enable CORS only for your domain
- Use HTTPS always

⚠️ **Performance**
- Monitor Appwrite usage
- Compress images before uploading
- Cache static assets
- Monitor database queries

⚠️ **Maintenance**
- Regular database backups
- Update dependencies
- Monitor error logs
- Test functionality regularly

## Common Issues

### "Failed to load articles"
- Check Appwrite connection
- Verify credentials
- Check CORS settings
- Clear browser cache

### "Image upload failed"
- Image size > 5MB
- Wrong file format
- Storage bucket not configured
- Appwrite permissions issue

### "Admin login fails"
- Wrong credentials
- Browser local storage issue
- Check admin email/password in config
- Clear browser cache

## Support Resources

- Appwrite Docs: https://appwrite.io/docs
- MDN Web Docs: https://developer.mozilla.org
- SEO Guide: https://moz.com/beginners-guide-to-seo
- GitHub Help: https://docs.github.com

---

Good luck with Khabar Darjeeling! 🚀
