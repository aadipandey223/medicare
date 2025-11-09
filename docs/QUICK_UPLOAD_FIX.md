# ⚡ QUICK ACTION - Get Key & Test (5 Minutes)

## Step 1: Get Service Role Key (2 min)
```
1. Go to: https://app.supabase.com/project/icvtjsfcuwqjhgduntyw/settings/api
2. Find: "service_role secret" section
3. Copy: The long key
```

## Step 2: Update .env File (1 min)
```
1. Open: e:\Aadi\medicare\medicare\.env
2. Find: SUPABASE_SERVICE_KEY=...
3. Replace: With your key
4. Save: Ctrl+S
```

## Step 3: Restart Backend (1 min)
```
Terminal:
Ctrl+C
python app.py

Wait for: ✅ Supabase initialized
```

## Step 4: Test Upload (1 min)
```
1. Browser: http://localhost:3000
2. Demo Login
3. Upload → Select file → Upload
4. Should work! ✅
```

---

## 🎯 What You'll See

**Working**:
```
Browser: ✅ File uploaded to cloud successfully!
Terminal: 📦 Upload complete
```

**Not Working**:
```
Browser: Upload failed: [error]
Terminal: ❌ [error]
```

---

## 🔑 Supabase Settings Path

```
https://app.supabase.com/project/icvtjsfcuwqjhgduntyw/settings/api
                                   ↑ Your project ID
                                   
In that page, find:
Project API keys
└─ service_role secret ← COPY THIS
```

---

## 📝 .env Edit

Find this line:
```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with actual key from Supabase (it's longer, about 200+ chars)

---

**That's it! Upload will work!**
