# Multi-Window Setup Guide

## Running Admin, Doctor, and Patient Sessions Simultaneously

You can now run **admin**, **doctor**, and **patient** sessions at the same time using different browser windows or profiles.

### Method 1: Using Browser Profiles (Recommended)

#### Chrome/Edge:
1. **Patient Window**: Open in normal mode
   - Go to `http://localhost:3000`
   - Login as patient

2. **Doctor Window**: Open in a new Chrome profile
   - Click your profile icon (top right) → "Add" → Create new profile
   - In the new window, go to `http://localhost:3000`
   - Login as doctor

3. **Admin Window**: Open in another Chrome profile
   - Create another profile
   - Go to `http://localhost:3000`
   - Login as admin

#### Firefox:
1. Type `about:profiles` in the address bar
2. Create new profiles for each role
3. Launch each profile in a separate window
4. Login with respective credentials

### Method 2: Using Different Browsers

- **Chrome**: Login as Patient
- **Firefox**: Login as Doctor  
- **Edge**: Login as Admin

### Method 3: Using Incognito/Private Windows

⚠️ **Note**: Private windows share the same session within themselves, so:
- **Regular Window**: Login as Patient
- **Incognito Window 1**: Login as Doctor
- **Incognito Window 2** (Different Browser): Login as Admin

---

## Key Features

### 1. Independent Sessions
Each browser profile maintains its own:
- Login credentials
- User role (patient/doctor/admin)
- Session state
- Chat history
- Notifications

### 2. Auto-Close Consultation When Marked as Cured

When a doctor marks a patient as **cured**:

✅ **Automatic Actions:**
- All active consultations with that patient are ended
- Chat becomes inactive
- Consultation status changes to "ended"
- Patient moves to "Cured Patients" list
- Doctor's "Completed Today" count updates

**Doctor Side:**
```
Doctor Panel → All Patients → Find Patient → Mark as Cured
```

**What Happens:**
- Active chat automatically closes
- Patient can no longer send messages
- Doctor can still view chat history
- Consultation appears in Reports as completed

### 3. Testing the Auto-Close Feature

1. **Patient Window**: Start a consultation with a doctor
2. **Doctor Window**: Accept the consultation request
3. **Both Windows**: Chat back and forth
4. **Doctor Window**: Go to "All Patients" → Click on the patient → "Mark as Cured"
5. **Patient Window**: The chat will show as ended
6. **Doctor Window**: Consultation moves to completed

---

## Common Issues & Solutions

### Issue: "Already logged in another window"
**Solution**: Use separate browser profiles (see Method 1 above)

### Issue: Sessions conflict
**Solution**: Clear localStorage in one window:
```javascript
// Open DevTools (F12) → Console → Run:
localStorage.clear()
// Then reload the page
```

### Issue: Can't see multiple windows data
**Solution**: Make sure you're using different browser profiles, not just tabs

### Issue: Consultation doesn't auto-close
**Solution**: 
- Refresh both patient and doctor windows
- Check if consultation was properly marked as cured
- Verify both users are on the correct chat page

---

## Quick Test Script

```bash
# Terminal 1: Start Backend
python app.py

# Terminal 2: Start Frontend  
npm run dev

# Browser Testing:
# 1. Chrome Profile 1 → http://localhost:3000 → Login as patient
# 2. Chrome Profile 2 → http://localhost:3000 → Login as doctor
# 3. Chrome Profile 3 → http://localhost:3000 → Login as admin
```

---

## Technical Details

### What Changed:
- ❌ Removed `sessionStorage` (shared across tabs)
- ✅ Using only `localStorage` (isolated per browser profile)
- ✅ Backend automatically ends consultations when marking as cured
- ✅ Frontend refreshes consultation status in real-time

### localStorage Keys:
```javascript
'token'  // Authentication token
'user'   // User data (name, email, role, etc.)
'role'   // User role (patient/doctor/admin)
```

---

## Best Practices

1. **Always use separate browser profiles** for production testing
2. **Label your profiles** (Patient, Doctor, Admin) to avoid confusion
3. **Don't mix tabs** - Use dedicated windows for each role
4. **Close old sessions** - Logout before switching roles in the same profile
5. **Refresh after marking as cured** to see immediate updates

---

## Support

If you encounter issues:
1. Clear browser cache and localStorage
2. Logout and login again
3. Check if backend server is running
4. Verify you're using different browser profiles
5. Check browser console for error messages (F12)
