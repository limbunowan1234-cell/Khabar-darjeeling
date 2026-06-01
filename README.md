# Khabar Darjeeling - News Website

A modern, mobile-friendly news portal for Darjeeling and West Bengal region built with HTML, CSS, JavaScript, and Appwrite.

## 🚀 Features

### 1. **Homepage**
- Professional news portal design with breaking news banner
- Featured story section with images
- Latest news grid with pagination
- Category navigation dropdown
- Search functionality
- Popular news sidebar
- Newsletter subscription
- Responsive design (mobile, tablet, desktop)

### 2. **News Submission System**
- User-friendly submission form with validation
- Fields: Title, Category, Location, Image, Content, Author Info
- Drag-and-drop image upload with preview
- Save to Appwrite Database with images in Storage
- All submissions set to "pending" status by default
- Email and phone validation
- Character count for title

### 3. **Admin Dashboard**
- Secure admin login with session management
- Statistics dashboard (Total, Pending, Published, Rejected)
- Pending articles review system
- Approve/Reject functionality with notes
- Edit articles before publishing
- Delete articles with image cleanup
- Manage and view all categories
- Article action buttons (View, Edit, Delete, Approve, Reject)

### 4. **News Display**
- Only approved articles shown publicly
- Single article page with full content
- SEO-friendly URLs (article.html?id=...)
- Featured images with lazy loading
- Author info, publication date, location, category
- Article view counter
- Share buttons (WhatsApp, Facebook, Twitter, Copy Link)
- Related articles section
- Sidebar with latest news

### 5. **Appwrite Integration**
- Cloud-based database (news_db)
- News collection with full schema
- Image storage bucket (news-images)
- Authentication support
- Scalable infrastructure
- Automatic backups

### 6. **SEO Optimization**
- Dynamic meta titles and descriptions
- NewsArticle JSON-LD schema markup
- Complete sitemap.xml generation
- robots.txt with crawl rules
- Canonical URLs for duplicate prevention
- Open Graph tags for social sharing
- Semantic HTML5 structure
- Mobile-first responsive design
- Fast page load optimization

### 7. **Categories**
- Darjeeling
- Kalimpong
- Kurseong
- Mirik
- Siliguri
- West Bengal
- National
- Entertainment
- Sports

### 8. **Design**
- Clean newspaper-style layout
- Red (#dc2626) and white color theme
- Professional typography (Segoe UI, Georgia)
- Dark mode toggle (saves preference)
- Fully responsive CSS
- Print-friendly styles
- Smooth animations and transitions
- Accessibility considerations

## 📋 Prerequisites

- Appwrite account (cloud.appwrite.io or self-hosted)
- Domain name (khabardarjeeling.space)
- Web hosting (Vercel, Netlify, GitHub Pages, or traditional hosting)
- Modern web browser with JavaScript enabled

## 🔧 Installation

### Quick Setup (5 minutes)

1. **Clone or download** the repository
2. **Configure Appwrite** (see SETUP.md)
3. **Update credentials** in js/config.js and js/admin.js
4. **Deploy** to your hosting
5. **Test** submission and admin panel

See `SETUP.md` for detailed step-by-step instructions.

## 📁 File Structure

```
Khabar-darjeeling/
├── index.html              # Homepage
├── article.html            # Single article page
├── submit.html             # News submission form
├── admin.html              # Admin dashboard
│
├── css/
│   ├── style.css          # Main stylesheet (24KB+)
│   ├── admin.css          # Admin dashboard styles
│   └── responsive.css     # Mobile/tablet responsive styles
│
├── js/
│   ├── config.js          # Configuration & constants
│   ├── appwrite.js        # Appwrite integration functions
│   ├── main.js            # Homepage functionality
│   ├── article.js         # Article page functionality
│   ├── submit.js          # Submission form functionality
│   └── admin.js           # Admin dashboard functionality
│
├── sitemap.xml            # SEO sitemap for all pages
├── robots.txt             # Search engine directives
├── README.md              # This file
└── SETUP.md               # Setup instructions
```

## 🌐 How It Works

### User Flow
1. User visits homepage (index.html)
2. Browses articles by category or search
3. Clicks article to read full story (article.html)
4. Submits news via form (submit.html)
5. Submission saved as "pending" in Appwrite

### Admin Flow
1. Admin logs in (admin.html)
2. Views pending submissions
3. Reviews content and attached image
4. Approves or rejects article
5. Published article appears on homepage

### Database Flow
- User submits form → Image uploaded to Storage → Article saved to Database with "pending" status
- Admin approves → Status changed to "approved" → Article appears on homepage
- Frontend queries only "approved" articles → Displays with proper formatting

## 🔐 Security

- Admin credentials should be changed immediately
- Use HTTPS for all connections
- Appwrite credentials stored in config file (not in repo in production)
- Input validation on all forms
- XSS protection via Appwrite
- SQL injection protection via Appwrite Database
- CORS configured per domain

## ⚡ Performance

- Lazy loading for images
- Responsive images for different screen sizes
- CSS minification recommended
- JavaScript code splitting possible
- Caching headers on static assets
- SEO optimization for faster indexing

## 📱 Responsive Design

- **Mobile (320px+)**: Full-width layout, stacked components
- **Tablet (768px+)**: Two-column layout, sidebar
- **Desktop (1024px+)**: Optimized three-column layout
- Print styles for article printing
- Touch-friendly buttons and interactions

## 🎨 Customization

### Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #dc2626;      /* Red */
    --accent-color: #f97316;        /* Orange */
    --text-dark: #1f2937;           /* Dark gray */
    --light-bg: #f9fafb;            /* Light gray */
}
```

### Fonts
Update in style.css:
```css
--font-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
--font-heading: 'Georgia', serif;
```

### Categories
Edit in js/config.js CATEGORIES array

## 📊 Analytics

Add Google Analytics by including in HTML head:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages
1. Push to GitHub
2. Settings → Pages → Main branch
3. Custom domain setup

### Traditional Hosting
1. FTP upload all files
2. Ensure .htaccess configured
3. Enable HTTPS

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Articles not loading | Check Appwrite connection and database |
| Images not showing | Verify storage bucket configured |
| Admin login fails | Check credentials and local storage |
| No search results | Verify database has "approved" articles |
| Sitemap errors | Validate XML in browser |

See detailed troubleshooting in SETUP.md

## 📚 Learning Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [MDN Web Docs](https://developer.mozilla.org)
- [SEO Basics](https://moz.com/beginners-guide-to-seo)
- [Responsive Design](https://web.dev/responsive-web-design-basics/)

## 🤝 Contributing

Found a bug or have suggestions? Open an issue or pull request!

## 📄 License

This project is provided as-is. Feel free to modify and use for your news portal.

## 🙏 Credits

Built with modern web technologies:
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with variables and flexbox
- **Vanilla JavaScript** - No dependencies, pure ES6+
- **Appwrite** - Backend infrastructure
- **Web Standards** - W3C compliant

## 📞 Support

1. Check SETUP.md for installation help
2. Review troubleshooting section
3. Check browser console for errors
4. Verify Appwrite configuration

---

**Version**: 1.0.0  
**Last Updated**: June 1, 2024  
**Status**: Production Ready ✅

Built for Khabar Darjeeling - Your trusted news source! 📰
