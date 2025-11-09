# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

Open terminal in the project folder and run:

\`\`\`bash
npm install
\`\`\`

This will install:
- React 18
- Material-UI (MUI) + Icons
- React Router
- Vite
- Other dependencies

## Step 2: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will open at `http://localhost:3000`

## Step 3: Explore the UI

### Pages Available:

1. **Auth Page** (`/auth`)
   - Login with email/password
   - Register new account
   - Google OAuth button (UI only, needs backend)

2. **Dashboard** (`/dashboard`)
   - Quick action cards
   - Health statistics
   - Recent activity
   - AI health tips

3. **Upload** (`/upload`)
   - Upload prescriptions/reports
   - File preview for images
   - Progress indicator

4. **Doctors** (`/doctors`)
   - Browse 6 sample doctors
   - Search by name/specialty
   - View ratings and experience
   - Consult button

5. **Consult** (`/consult`)
   - Real-time chat UI
   - Message bubbles
   - Send messages
   - Attachment/emoji/voice buttons

6. **LLM Analysis** (`/llm-analysis`)
   - Symptom input form
   - AI analysis results
   - Recommendations
   - Warnings
   - Next steps

7. **History** (`/history`)
   - Timeline view
   - Filter by type
   - Detailed activity cards
   - Export button

8. **Notifications** (`/notifications`)
   - Unread badge
   - Mark as read
   - Delete notifications
   - Filter all/unread

## Features Implemented

✅ Modern, beautiful UI with Material-UI
✅ Smooth animations and transitions
✅ Responsive design (mobile + desktop)
✅ Navigation sidebar (permanent on desktop, drawer on mobile)
✅ Gradient backgrounds and custom theming
✅ Icon-based navigation
✅ Form validation (client-side)
✅ File upload with preview
✅ Chat interface
✅ Timeline/stepper components
✅ Search and filter functionality
✅ Badge indicators
✅ Loading states

## What's Next?

### Backend Integration Needed:

1. **Authentication**
   - Connect login/register to Flask API
   - Implement JWT token storage
   - Add Google OAuth flow
   - Protected routes

2. **File Upload**
   - Upload files to server
   - Store file metadata in database
   - Retrieve uploaded files

3. **Doctors**
   - Fetch doctors from database
   - Real-time availability status
   - Booking system

4. **Consult/Chat**
   - WebSocket for real-time messaging
   - Store chat history
   - Doctor replies

5. **LLM Analysis**
   - Connect to AI/LLM backend
   - Process symptoms
   - Generate recommendations

6. **History**
   - Fetch user's medical history from database
   - Real-time updates

7. **Notifications**
   - Real-time notification system
   - Push notifications
   - WebSocket integration

## Customization

### Change Theme Colors

Edit `src/App.jsx`:

\`\`\`javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#YOUR_COLOR',
    },
    // ... more colors
  },
});
\`\`\`

### Modify Pages

All pages are in `src/pages/` - edit any file to customize the UI.

### Add New Pages

1. Create new component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add menu item in `src/components/Navigation.jsx`

## Build for Production

\`\`\`bash
npm run build
\`\`\`

Output will be in `dist/` folder.

## Technologies Used

- **React 18** - Latest React features
- **Vite** - Lightning fast build tool
- **Material-UI v5** - Modern component library
- **React Router v6** - Client-side routing
- **Inter Font** - Beautiful typography

## Tips

- Press `Ctrl+C` to stop the dev server
- Changes auto-reload in the browser
- Check browser console for errors
- Use React DevTools for debugging

---

**Enjoy building with Medicare Patient Portal! 🏥**
