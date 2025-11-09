# HOS Authentication Guide

## ✅ Authentication is Working Correctly!

The authentication system is functioning as designed. The error messages you're seeing are **normal and expected** behaviors.

## 🔍 Understanding the Messages

### 1. "Session check timed out after 3s"
**Status:** ⚠️ **Warning (Not an Error)**

This message appears when:
- You've just logged out
- You're visiting HOS for the first time
- Your session expired

**Why it happens:**
After logout, there's no cached session in localStorage, so the system checks with Supabase. The 3-second timeout prevents the app from hanging if the network is slow.

**Action needed:** None! This is normal. Just log in again.

---

### 2. "Invalid login credentials"
**Status:** ❌ **Error (User Action Required)**

This means one of the following:

#### Most Common Causes:

1. **❌ Account doesn't exist yet**
   - You need to register first!
   - Click "Awaken" on the landing page to create an account
   - Then use those same credentials to log in

2. **❌ Wrong password**
   - Passwords are case-sensitive
   - Check if Caps Lock is on
   - Make sure you're using the exact password you registered with

3. **❌ Typo in email**
   - Double-check the email spelling
   - Common mistakes: .com vs .co, gmail vs gmial

4. **❌ Using different credentials**
   - Make sure you're using the same email/password you registered with
   - If you forgot, you'll need to register a new account

---

## 🚀 Getting Started (First Time Users)

### Step 1: Register an Account
1. Click **"Awaken"** on the landing page
2. Fill in:
   - Your name
   - Email address
   - Password (at least 6 characters)
   - Choose your interface type
   - Accept consent
3. Click **"Initialize Consciousness"**
4. Wait for success message

### Step 2: You're In!
After registration, you'll automatically be logged in and see the HOS dashboard.

### Step 3: Logging Out & Back In
1. Click the **logout icon** in the sidebar (top left, desktop) or hamburger menu (mobile)
2. You'll see a success message and return to the landing page
3. Click **"Resume Consciousness"**
4. Enter the **same email and password** you used to register
5. Click **"Resume"**

---

## 🐛 Troubleshooting Login Issues

### Problem: "Invalid login credentials" Error

**Solution 1: Make sure you're registered**
```
✅ Have you created an account?
   → If NO: Go back and click "Awaken" to register
   → If YES: Continue to Solution 2
```

**Solution 2: Check your credentials**
```
✅ Email correct?
   - No extra spaces
   - Correct domain (.com, .org, etc.)
   - Same email you used to register

✅ Password correct?
   - Case-sensitive (Password ≠ password)
   - Caps Lock off
   - No extra spaces
   - Same password you used to register
```

**Solution 3: Try registering with a different email**
```
If you can't remember your password:
→ Use a different email to create a new account
→ Your old data will still be there when you remember
```

---

## 🔒 Security Notes

- **Email confirmation:** Auto-confirmed (no email server setup needed)
- **Password requirements:** Minimum 6 characters
- **Session duration:** Sessions persist until you log out
- **Data encryption:** All data is encrypted and stored securely
- **Local caching:** Session cached for faster app loading

---

## 💡 Helpful Features

### On Login Page:
- **"Create Account Instead" button** - Appears when login fails
- **Back button** - Returns to landing page
- **Helpful error hints** - Shows common issues and solutions

### On Registration Page:
- **"Already have an account?" link** - Switches to login
- **Password visibility toggle** - See what you're typing
- **Interface selection** - Choose your preferred mode

### On Landing Page:
- **Info alert** - Guides first-time users
- **Two clear options** - Awaken (register) or Resume (login)
- **Social links** - Follow HOS on Twitter/X

---

## 🎯 Quick Reference

| Action | Button/Link |
|--------|-------------|
| Create new account | "Awaken" on landing page |
| Log in to existing account | "Resume Consciousness" on landing page |
| Log out | Logout icon in sidebar header |
| Switch from login to register | "Create Account Instead" button |
| Switch from register to login | "Already have an account?" link |
| Return to landing page | "Back" button |

---

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Clear your browser cache and cookies**
2. **Try in an incognito/private window**
3. **Check browser console** for detailed error messages (F12 → Console tab)
4. **Try a different browser**
5. **Follow HOS on Twitter/X** for updates: [@hos_core](https://x.com/hos_core?s=21)

---

## ✨ System Status

- ✅ Registration: **Working**
- ✅ Login: **Working**
- ✅ Logout: **Working**
- ✅ Session persistence: **Working**
- ✅ Data encryption: **Working**
- ✅ Auto-sync: **Working**

**Last Updated:** October 25, 2025
**System Version:** v3.0
**Authentication Provider:** Supabase
