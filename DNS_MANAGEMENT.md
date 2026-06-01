# 🌐 DNS Management Guide for khabardarjeeling.space

## What is DNS?

**DNS (Domain Name System)** translates your domain name (khabardarjeeling.space) into an IP address that computers understand.

Think of it like:
- **Your domain name** = Your home address (easy to remember)
- **IP address** = GPS coordinates (where servers actually live)
- **DNS** = The phonebook that converts one to the other

---

## 📍 Where to Manage Your DNS

### **Step 1: Find Your Domain Registrar**

Where did you buy `khabardarjeeling.space`? Common options:
- 🔗 **GoDaddy** - godaddy.com
- 🔗 **Namecheap** - namecheap.com
- 🔗 **Google Domains** - domains.google.com
- 🔗 **Bluehost** - bluehost.com
- 🔗 **HostGator** - hostgator.com
- 🔗 **Domain.com** - domain.com
- 🔗 **Porkbun** - porkbun.com

**Don't know?** Check your email for domain purchase confirmation.

### **Step 2: Log In to Your Registrar**

1. Go to your registrar's website
2. Log in with your account
3. Find **"My Domains"** or **"Manage Domains"**
4. Click on `khabardarjeeling.space`

---

## 🔧 Two Ways to Connect to Netlify

### **Option 1: Use Netlify Nameservers (EASIEST - Recommended)**

This lets Netlify manage ALL your DNS records automatically.

#### **In Netlify Dashboard:**
1. Go to your site
2. Click **Domain management**
3. Click **Add custom domain**
4. Enter: `khabardarjeeling.space`
5. Click **Verify**
6. You'll see: **"Netlify nameservers"** option

#### **Copy these 4 nameservers:**
```
dns1.netlify.com
dns2.netlify.com
dns3.netlify.com
dns4.netlify.com
```

#### **In Your Domain Registrar (GoDaddy/Namecheap/etc):**

**For GoDaddy:**
1. Go to "My Domains"
2. Click on `khabardarjeeling.space`
3. Find **"Nameservers"** section
4. Click **"Edit"**
5. Change from default to **Custom**
6. Delete existing nameservers
7. Add Netlify's 4 nameservers
8. Click **Save**

**For Namecheap:**
1. Go to **Dashboard**
2. Click on `khabardarjeeling.space`
3. Go to **Nameservers**
4. Select **Custom DNS**
5. Add Netlify's 4 nameservers
6. Click **Save**

**For Google Domains:**
1. Click on `khabardarjeeling.space`
2. Go to **DNS** in left menu
3. Scroll to **"Custom nameservers"**
4. Add Netlify's 4 nameservers
5. Click **Save**

**⏳ Wait 5-30 minutes** for DNS to propagate

---

### **Option 2: Use DNS Records (MANUAL)**

Use this if you want to manage DNS yourself or use registrar's DNS.

#### **In Netlify Dashboard:**
1. Go to your site
2. Click **Domain management**
3. Click **Add custom domain** → `khabardarjeeling.space`
4. Choose **"Point to Netlify nameservers with DNS records"**
5. You'll see DNS records to add

#### **Records to Add:**

**A Record (for main domain):**
```
Type:    A
Name:    @ (or leave blank)
Value:   75.2.60.5 (or Netlify's IP shown in dashboard)
TTL:     3600 (or default)
```

**CNAME Record (for www subdomain):**
```
Type:    CNAME
Name:    www
Value:   khabar-darjeeling.netlify.app
TTL:     3600 (or default)
```

#### **How to Add Records in Your Registrar:**

**GoDaddy:**
1. My Domains → `khabardarjeeling.space`
2. **Manage** DNS
3. Click **Add** (under DNS Records)
4. Fill in Type, Name, Value
5. Click **Save**

**Namecheap:**
1. Dashboard → `khabardarjeeling.space`
2. **Advanced DNS**
3. Click **Add New Record**
4. Select Type, enter Name, Value
5. Click ✓ to save

**Google Domains:**
1. Click `khabardarjeeling.space`
2. **DNS** → **Custom records**
3. Click **Create new record**
4. Fill in details
5. Click **Create**

**⏳ Wait 5-30 minutes** for changes to take effect

---

## ✅ Check if DNS is Working

### **Method 1: Simple Check**
1. Wait 10-15 minutes
2. Go to: https://khabardarjeeling.space
3. If it loads your site = **Success!** ✅

### **Method 2: Advanced Check (for troubleshooting)**

**Using Online Tools:**

**DNS Checker:**
- Go to: https://dnschecker.org
- Enter: `khabardarjeeling.space`
- Click **Check**
- Should see Netlify's IP address

**MX Toolbox:**
- Go to: https://mxtoolbox.com
- Click **DNS Lookup**
- Enter: `khabardarjeeling.space`
- Look for A record pointing to Netlify

**Nslookup (Command Line):**
```bash
# Windows: Open Command Prompt
# Mac/Linux: Open Terminal

nslookup khabardarjeeling.space

# Should see Netlify's IP address in results
```

---

## 🐛 Troubleshooting DNS Issues

### **Problem 1: Domain not working (showing registrar page)**

**Cause:** DNS not yet propagated or wrong records

**Fix:**
1. Wait 15-30 minutes
2. Clear browser cache: `Ctrl+Shift+Del`
3. Try different browser
4. Use DNS checker at https://dnschecker.org
5. Check nameservers are correct in registrar

### **Problem 2: Certificate error (red lock)**

**Cause:** HTTPS not properly configured

**Fix (in Netlify):**
1. Go to **Domain management**
2. Look for SSL certificate status
3. Click **Renew certificate** if needed
4. Wait 5 minutes
5. Refresh browser

### **Problem 3: www subdomain works but main domain doesn't**

**Cause:** A record missing or wrong

**Fix:**
- Add A record: `@` → Netlify's IP address
- Add CNAME for www

### **Problem 4: Changes not taking effect**

**Cause:** DNS cache

**Fix:**
```bash
# Clear local DNS cache
# Windows (Command Prompt - run as admin):
ipconfig /flushdns

# Mac (Terminal):
sudo dscacheutil -flushcache

# Linux:
sudo systemctl restart systemd-resolved
```

### **Problem 5: One nameserver shows different IP**

**Cause:** DNS propagation in progress

**Fix:** Wait 1-2 hours for full propagation

---

## 📊 DNS Records Explained

### **A Record**
```
Type:  A
Name:  @ or blank
Value: 75.2.60.5 (IPv4 address)
Purpose: Points domain to Netlify server
```

### **CNAME Record**
```
Type:  CNAME
Name:  www
Value: khabar-darjeeling.netlify.app
Purpose: Points www subdomain to Netlify
```

### **MX Record** (for email - optional)
```
Type:     MX
Name:     @ (for main domain)
Value:    mail.youremail.com
Priority: 10
Purpose:  Routes emails (not needed for news site)
```

### **TXT Record** (for verification)
```
Type:  TXT
Name:  @ or _acme-challenge
Value: verification-string-from-netlify
Purpose: HTTPS/SSL verification (Netlify handles this)
```

---

## 🔄 DNS Propagation Timeline

DNS changes don't happen instantly. Here's the typical timeline:

| Time | Status |
|------|--------|
| 0-5 min | Changes saved at registrar |
| 5-15 min | Some DNS servers updated |
| 15-30 min | Most servers updated |
| 30-48 hrs | All servers worldwide updated (TTL dependent) |

**TTL (Time To Live):** How long DNS servers cache your records
- Default: 3600 seconds (1 hour)
- Lower TTL = Faster updates but more server load
- Don't change unless you know what you're doing

---

## 🛡️ Best Practices

### **Do's:**
✅ Keep registrar and hosting separate (flexibility)
✅ Use strong passwords for registrar
✅ Check DNS records monthly
✅ Set DNS alerts in Netlify
✅ Use nameservers for easier management
✅ Keep backup of your DNS records

### **Don'ts:**
❌ Don't manually edit DNS if using Netlify nameservers
❌ Don't delete all nameservers at once
❌ Don't share DNS credentials
❌ Don't change DNS during peak traffic
❌ Don't use very low TTL permanently

---

## 📋 Step-by-Step: Complete DNS Setup

### **For GoDaddy Users:**

```
1. Log in to GoDaddy.com
2. Click "My Products"
3. Find khabardarjeeling.space → Click it
4. Scroll to "Nameservers"
5. Click "Change nameservers"
6. Select "I'll use someone else's nameservers"
7. Delete all existing nameservers
8. Add Netlify nameservers:
   - dns1.netlify.com
   - dns2.netlify.com
   - dns3.netlify.com
   - dns4.netlify.com
9. Click "Save"
10. Wait 15-30 minutes
11. Test at https://khabardarjeeling.space
```

### **For Namecheap Users:**

```
1. Log in to Namecheap.com
2. Click "Dashboard"
3. Click khabardarjeeling.space
4. Click "Manage" or "Go to Dashboard"
5. Look for "Nameservers" section
6. Click "Manage Nameservers"
7. Select "Custom DNS"
8. Add Netlify nameservers:
   - dns1.netlify.com
   - dns2.netlify.com
   - dns3.netlify.com
   - dns4.netlify.com
9. Click the checkmark/save
10. Wait 15-30 minutes
11. Test at https://khabardarjeeling.space
```

### **For Google Domains Users:**

```
1. Go to domains.google.com
2. Click khabardarjeeling.space
3. Click "DNS" in left menu
4. Scroll to "Custom nameservers"
5. Click "Switch to custom nameservers"
6. Add Netlify nameservers:
   - dns1.netlify.com
   - dns2.netlify.com
   - dns3.netlify.com
   - dns4.netlify.com
7. Click "Save"
8. Wait 15-30 minutes
9. Test at https://khabardarjeeling.space
```

---

## 🔍 Verify Everything is Working

### **Checklist:**
- [ ] Domain registrar shows Netlify nameservers
- [ ] DNS checker shows Netlify IP
- [ ] HTTPS lock appears (🔒)
- [ ] https://khabardarjeeling.space loads your site
- [ ] https://www.khabardarjeeling.space also works
- [ ] No certificate warnings

---

## 📞 Quick Troubleshooting Phone Numbers

| Service | Support |
|---------|---------|
| **Netlify** | support@netlify.com / app.netlify.com/help |
| **GoDaddy** | 1-480-505-8877 |
| **Namecheap** | support.namecheap.com |
| **Google Domains** | support.google.com/domains |

---

## 🎓 Learning Resources

- **Netlify DNS Guide:** https://docs.netlify.com/domains-https/custom-domains/
- **GoDaddy DNS Help:** https://godaddy.com/help
- **Namecheap DNS Guide:** https://namecheap.com/support/knowledgebase/
- **DNS Explained:** https://www.cloudflare.com/learning/dns/what-is-dns/

---

## ⏱️ Expected Timeline

| Task | Time |
|------|------|
| Update nameservers | 5 min |
| DNS propagation | 15-30 min |
| HTTPS certificate | 5-10 min |
| Site fully live | 30-45 min |

**Total time to go live: ~45 minutes** ✅

---

## 🎯 Your Domain Setup

**Domain:** khabardarjeeling.space
**Hosting:** Netlify
**Method:** Netlify Nameservers (recommended)
**Nameservers:**
- dns1.netlify.com
- dns2.netlify.com
- dns3.netlify.com
- dns4.netlify.com

---

**Need help? Check the troubleshooting section or contact your registrar's support!**
