# 🔧 Namecheap DNS Setup for khabardarjeeling.space

## ⚡ Quick Answer: What to Enter in Namecheap

**You have TWO options:**

---

## ✅ OPTION 1: Custom Nameservers (EASIEST & RECOMMENDED)

This is the SIMPLEST way. You don't need IP addresses.

### **Step 1: Get Nameservers from Netlify Dashboard**

1. Go to https://app.netlify.com
2. Select your site
3. Click **Domain management**
4. Add domain: `khabardarjeeling.space`
5. Copy the **4 Netlify nameservers** shown

They look like:
```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```
*(Your exact nameservers may be different - copy from YOUR Netlify dashboard)*

### **Step 2: Enter in Namecheap**

1. **Log in to Namecheap** → https://www.namecheap.com
2. Click **Account** (top right) → **Manage Domains**
3. Find and click **`khabardarjeeling.space`**
4. Look for **Domain** section in left menu
5. Click **Nameservers**

You'll see a dropdown showing:
```
⭕ Namecheap BasicDNS
⭕ Namecheap PremiumDNS
⭕ Custom DNS
```

6. **Select → Custom DNS** ← Click here!

### **Step 3: Add the 4 Netlify Nameservers**

You'll see fields like:
```
Nameserver 1: ________________
Nameserver 2: ________________
Nameserver 3: ________________
Nameserver 4: ________________
```

**Enter these (copy from your Netlify dashboard):**
```
Nameserver 1: dns1.p01.nsone.net
Nameserver 2: dns2.p01.nsone.net
Nameserver 3: dns3.p01.nsone.net
Nameserver 4: dns4.p01.nsone.net
```

7. Click the **green checkmark ✓** to save
8. Wait for **"success"** message

**Done!** ✅ Wait 15-30 minutes for DNS to update.

---

## ⚠️ OPTION 2: Manual A Records + CNAME (ADVANCED)

Use this only if Option 1 doesn't work or you want manual control.

### **What You Need:**

**From Netlify Dashboard:**

1. Go to https://app.netlify.com
2. Select your site
3. Click **Domain management**
4. Add domain: `khabardarjeeling.space`
5. Select **"Point to Netlify nameservers with DNS records"**
6. You'll see:

```
A Record:
Type: A
Host/Name: @ (or your domain)
Value: 75.2.60.5 (EXAMPLE - copy yours from Netlify)

CNAME Record:
Type: CNAME
Host/Name: www
Value: khabar-darjeeling.netlify.app
```

**⚠️ IMPORTANT:** The exact IP address shown in YOUR Netlify dashboard may be different. Copy it from there, not from this example!

### **Steps in Namecheap:**

1. Log in to **Namecheap** → **Manage Domains**
2. Click **`khabardarjeeling.space`**
3. Go to **Domain** → **Nameservers**
4. Make sure it shows: **Namecheap BasicDNS** (NOT Custom DNS)
5. Click **Advanced DNS** (different tab)

#### **Add A Record:**

You'll see existing records. Click **Add New Record**

```
Type:    A
Host:    @ (this means the main domain)
Value:   75.2.60.5 (use the IP from YOUR Netlify dashboard)
TTL:     3600
```

Then click **✓** (checkmark) to save

#### **Add CNAME Record:**

Click **Add New Record** again

```
Type:    CNAME
Host:    www
Value:   khabar-darjeeling.netlify.app
TTL:     3600
```

Then click **✓** (checkmark) to save

**Done!** ✅ Wait 15-30 minutes for DNS to update.

---

## 📋 Quick Reference Table

| Setting | Value | Notes |
|---------|-------|-------|
| **Option** | Custom DNS | Choose this in Namecheap |
| **Nameserver 1** | dns1.p01.nsone.net | From your Netlify dashboard |
| **Nameserver 2** | dns2.p01.nsone.net | From your Netlify dashboard |
| **Nameserver 3** | dns3.p01.nsone.net | From your Netlify dashboard |
| **Nameserver 4** | dns4.p01.nsone.net | From your Netlify dashboard |

---

## 🎯 Exact Namecheap Navigation Path

```
1. namecheap.com
   ↓
2. Click Account (top right corner)
   ↓
3. Click "Manage Domains"
   ↓
4. Find khabardarjeeling.space → Click it
   ↓
5. Look for left sidebar, click "Domain"
   ↓
6. You'll see options:
      - Overview
      - Manage Domain
      - Nameservers
      - Advanced DNS
   ↓
7. Click "Nameservers"
   ↓
8. See dropdown options:
      ⭕ Namecheap BasicDNS
      ⭕ Namecheap PremiumDNS  
      ⭕ Custom DNS ← SELECT THIS!
   ↓
9. Select "Custom DNS"
   ↓
10. Fill in 4 nameserver fields with Netlify's
   ↓
11. Click green checkmark ✓
   ↓
12. See "Success" message
   ↓
13. DONE! ✅
```

---

## ❌ Common Mistakes (AVOID THESE!)

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| Using Namecheap's own DNS | Use **Custom DNS** with Netlify |
| Copying old/wrong nameservers | Copy from YOUR Netlify dashboard |
| Only adding 2 nameservers | Add **all 4** nameservers |
| Adding IP addresses instead of domain names | Namecheap wants domain names, not IPs |
| Forgetting the exact format | Copy-paste exact names from Netlify |
| Not waiting for propagation | Wait 15-30 minutes before testing |
| Deleting all DNS records first | No need to delete anything |

---

## ✅ How to Verify It's Working

### **In Namecheap (After saving):**
1. Go back to **Nameservers** tab
2. You should see your 4 Netlify nameservers listed
3. No error messages

### **Online Check (After 10-15 minutes):**
1. Go to https://dnschecker.org
2. Enter: `khabardarjeeling.space`
3. Click **Check**
4. All 4 nameservers should show Netlify's names

### **Browser Test (After 15-30 minutes):**
1. Clear cache: `Ctrl+Shift+Delete`
2. Go to: https://khabardarjeeling.space
3. Should load your site with 🔒 (HTTPS lock)

---

## 🐛 Troubleshooting

### **Problem: Still shows Namecheap's nameservers**

**Fix:**
1. Refresh Namecheap page (F5)
2. Check you selected **Custom DNS** (not BasicDNS)
3. Make sure you clicked the **green checkmark ✓**
4. Wait another 5 minutes and refresh

### **Problem: Getting "Cannot connect to server"**

**Causes & Fixes:**
1. **DNS not yet propagated** → Wait 30 minutes
2. **Wrong nameservers entered** → Double-check in Namecheap
3. **Netlify nameservers wrong** → Copy again from Netlify dashboard
4. **Typo in domain name** → Check spelling exactly
5. **Browser cache** → Clear cache and try again

### **Problem: HTTPS shows error or warning**

**Fix:**
1. Wait 5-10 more minutes (SSL certificate is being issued)
2. Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. Try different browser
4. Go to Netlify dashboard → Domain management → check SSL status

### **Problem: www works but main domain doesn't**

**Fix (Option 1 users):**
- Just wait longer, it should resolve automatically

**Fix (Option 2 users):**
- Make sure you added the A record with Host: `@`
- Check the IP address is correct

---

## 📞 Support Links

**If you get stuck:**

| Problem | Where to Get Help |
|---------|-------------------|
| Namecheap DNS | https://www.namecheap.com/support/ |
| Netlify DNS | https://app.netlify.com/help |
| DNS checking | https://dnschecker.org |
| Technical help | Check Netlify forums |

---

## ⏱️ Timeline

```
✓ 0 min    → Update nameservers in Namecheap
✓ 5 min    → Changes saved
✓ 15 min   → Most DNS servers updated
✓ 30 min   → Almost fully propagated
✓ 1-2 hrs  → Completely propagated worldwide
```

**Most people see it working in 15-30 minutes** ⚡

---

## 🎓 What's Actually Happening

When you point Namecheap to Netlify's nameservers:

1. **You:** Update Namecheap settings
2. **Namecheap:** Tells the world "Ask Netlify about khabardarjeeling.space"
3. **DNS servers worldwide:** Start caching this info (5-30 mins)
4. **People visiting:** Get directed to Netlify (where your site lives)
5. **Your site:** Loads from Netlify server ✅

---

## 🚀 Next Steps After DNS Setup

Once DNS is working (you can visit https://khabardarjeeling.space):

1. **Setup Appwrite** → Follow SETUP.md
2. **Verify site works** → Test all pages
3. **Submit sitemap** → Google Search Console
4. **Monitor traffic** → Netlify Analytics

---

## 💡 Pro Tips

1. **DNS changes are free** - No extra cost!
2. **Can't break anything** - You can always change back to Namecheap DNS
3. **Use OPTION 1** - It's easier and more reliable
4. **Copy exactly** - Don't retype, always copy-paste
5. **Wait patiently** - DNS propagation can't be rushed

---

## ✨ You're Almost There!

**Your Khabar Darjeeling website goes live after:**
1. ✅ DNS updated (you are here)
2. ⏳ DNS propagates (15-30 minutes)
3. ⏳ SSL certificate issued (5-10 minutes)
4. ✅ Test your site
5. 🎉 LIVE!

---

**Questions? Stuck somewhere? Let me know!** 🎯

Your domain: **khabardarjeeling.space**
Your host: **Netlify**
Your files: **Ready to deploy!** 🚀
