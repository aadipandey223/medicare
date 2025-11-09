# ⚡ Supabase Google OAuth - Quick Implementation (30 min)

## What You'll Get
✅ "Sign in with Google" button
✅ Automatic user creation
✅ Secure session handling
✅ No passwords needed

---

## Phase 1: Google Cloud Setup (5 min)

### 1. Go to Google Cloud Console
```
https://console.cloud.google.com
```

### 2. Create Project
```
Top left: Select project → New project
Name: Medicare
Create
Wait 30 sec
```

### 3. Enable Google+ API
```
Search: "Google+ API"
Click it
Click: Enable
```

### 4. Create OAuth Consent Screen
```
Left sidebar: OAuth consent screen
User type: External
Create
```

**Fill in**:
```
App name: Medicare
User support email: aadipandey223@gmail.com
Developer contact: aadipandey223@gmail.com
Save and Continue
```

**Keep defaults, Continue → Continue → Back to Dashboard**

### 5. Create Credentials
```
Left sidebar: Credentials
New → OAuth Client ID → Web application
Name: Medicare Web
```

**Add URLs**:
```
JavaScript origins:
  http://localhost:3000

Redirect URIs:
  http://localhost:3000
  http://localhost:3000/auth/callback
```

Create → Copy both:
- Client ID
- Client Secret

---

## Phase 2: Supabase Setup (3 min)

### 1. Go to Supabase Auth
```
https://app.supabase.com/project/icvtjsfcuwqjhgduntyw/auth/providers
```

### 2. Find Google Provider
```
Scroll to: Google
Toggle: ON
```

### 3. Add Credentials
```
Client ID: (paste from Google)
Client Secret: (paste from Google)
Save
```

**Done!** Google OAuth enabled in Supabase!

---

## Phase 3: Add to Frontend (15 min)

### Option A: Use Built-in UI (Easiest)

**Install package** (if not already):
```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

**Add to Login page** (`src/pages/Auth.jsx` or similar):
```jsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSupabaseClient } from '@supabase/react-hooks'

export default function LoginPage() {
  const supabaseClient = useSupabaseClient()

  return (
    <Auth
      supabaseClient={supabaseClient}
      appearance={{ theme: ThemeSupa }}
      providers={['google']}
      redirectTo={`${window.location.origin}/auth/callback`}
    />
  )
}
```

**Result**: Built-in UI with email + Google + password options!

---

### Option B: Custom Google Button Only

**Add to Login page**:
```jsx
import { useSupabaseClient } from '@supabase/react-hooks'
import { Button } from '@mui/material'
import { Google as GoogleIcon } from '@mui/icons-material'

export default function LoginPage() {
  const supabase = useSupabaseClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Google login error:', error)
      alert('Login failed: ' + error.message)
    }
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="contained"
      startIcon={<GoogleIcon />}
      fullWidth
    >
      Sign in with Google
    </Button>
  )
}
```

**Result**: Clean custom button!

---

## Phase 4: Handle Auth Callback (5 min)

### 1. Create Callback Handler

**File**: `src/pages/AuthCallback.jsx`

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/react-hooks'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const supabase = useSupabaseClient()
  const { login } = useAuth()

  useEffect(() => {
    // Get session from URL
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth error:', error)
        navigate('/login')
        return
      }
      
      if (data.session) {
        // User logged in with Supabase
        const user = data.session.user
        
        // Create user object
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          phone: user.user_metadata?.phone || '',
          age: null,
          gender: '',
          medical_history: ''
        }
        
        // Login to your app
        login(data.session.access_token, userData)
        
        // Redirect to dashboard
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    }

    getSession()
  }, [])

  return <div>Logging in...</div>
}
```

### 2. Add Route

**File**: `src/App.jsx`

```jsx
import AuthCallback from './pages/AuthCallback'

// Add to your routes:
<Route path="/auth/callback" element={<AuthCallback />} />
```

---

## Phase 5: Test (5 min)

### 1. Start Your App
```bash
npm run dev
```

### 2. Go to Login Page
```
http://localhost:3000/login
```

### 3. Click "Sign in with Google"

### 4. Enter Your Google Account

### 5. Authorize App

### 6. Should Redirect to Dashboard!

---

## 🎯 Expected Flow

```
User clicks: "Sign in with Google"
↓
Redirected to Google login
↓
User enters: Google credentials
↓
Google asks: Authorize app?
↓
User clicks: Yes
↓
Redirected back to: /auth/callback
↓
Your app: Gets session from Supabase
↓
Your app: Creates user object
↓
Your app: Calls login()
↓
Redirected to: /dashboard
↓
User logged in! ✅
```

---

## ✅ Verification

### Check 1: Browser Storage
```
F12 → Application tab
Look for: sb-icvtjsfcuwqjhgduntyw-auth-token
Should contain: JWT token
```

### Check 2: Supabase Dashboard
```
https://app.supabase.com/project/icvtjsfcuwqjhgduntyw/auth/users
Should show: Your user in list
```

### Check 3: Your App
```
Should show: You're logged in
Should display: Your name/email
```

---

## 🆘 Troubleshooting

### "Google button doesn't appear"
```
Check:
1. Installed @supabase/auth-ui-react?
2. Is Google enabled in Supabase?
3. Are credentials added to Supabase?
4. Restart: npm run dev
```

### "Redirect URI mismatch"
```
Check:
1. In Google Console: Authorized redirect URIs
2. Must include: http://localhost:3000/auth/callback
3. Save
4. Wait 1 minute
5. Try again
```

### "User not created after login"
```
Check:
1. Is AuthCallback component working?
2. Is login() being called?
3. Check console for errors (F12)
4. Check Supabase for user creation
```

### "Still shows login after redirect"
```
Check:
1. Is /auth/callback route working?
2. Does useAuth() have login function?
3. Is token being stored?
4. Check localStorage (F12)
```

---

## 📊 What Gets Created

### In Supabase Auth
```
✅ Auth user created
✅ Email from Google
✅ Name from Google
✅ Google ID stored
✅ Session token created
```

### In Your App
```
✅ User stored in localStorage
✅ Token in localStorage
✅ AuthContext updated
✅ User logged in
```

### In Your Database (Optional)
```
If you want:
- Backend creates User in SQLite
- Links to Supabase user ID
- Stores additional info
```

---

## 🚀 Next Steps (Optional)

### Add More Providers
```jsx
providers={['google', 'github', 'discord']}
// Just add to the list!
```

### Link Accounts
```jsx
// User can link multiple accounts
// E.g., Email + Google
```

### Multi-Factor Auth
```jsx
// Supabase has built-in MFA
// Enable in Auth settings
```

---

## 📝 Your Implementation Checklist

- [ ] Got Google OAuth credentials
- [ ] Added to Supabase Auth
- [ ] Installed @supabase/auth-ui-react
- [ ] Added Google button to login page
- [ ] Created AuthCallback component
- [ ] Added /auth/callback route
- [ ] Tested with your Google account
- [ ] User appears in Supabase dashboard
- [ ] localStorage has token
- [ ] App redirects to dashboard
- [ ] Login persists on refresh
- [ ] Done! ✅

---

## 🎉 YOU'RE DONE!

**Google OAuth is now fully integrated!**

Users can now:
✅ Click "Sign in with Google"
✅ Login with 1 click
✅ No passwords needed
✅ Automatic account creation
✅ Secure sessions

**Time invested**: 30 minutes
**Result**: Professional auth system! 🎉

---

**Next**: Deploy to production and enable HTTPS!
