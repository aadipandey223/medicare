# Email Setup Instructions for Medicare Feedback

## Overview
The feedback system is now configured to send actual emails from patient/doctor submissions to `aadipandey223@gmail.com`.

## Setup Steps

### 1. Enable Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Enable **2-Step Verification** if not already enabled
4. After enabling 2FA, search for **App passwords**
5. Create a new App Password:
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Name it: **Medicare Portal**
6. Google will generate a 16-character password (like: `abcd efgh ijkl mnop`)
7. **Copy this password** - you'll need it for the environment variable

### 2. Set Environment Variables

**Windows (PowerShell):**
```powershell
# Temporary (current session only)
$env:EMAIL_USER = "aadipandey223@gmail.com"
$env:EMAIL_PASSWORD = "your-16-char-app-password-here"

# Permanent (for all future sessions)
[System.Environment]::SetEnvironmentVariable('EMAIL_USER', 'aadipandey223@gmail.com', 'User')
[System.Environment]::SetEnvironmentVariable('EMAIL_PASSWORD', 'your-16-char-app-password-here', 'User')
```

**Linux/Mac:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export EMAIL_USER="aadipandey223@gmail.com"
export EMAIL_PASSWORD="your-16-char-app-password-here"

# Then reload:
source ~/.bashrc
```

**Using .env file (recommended for development):**

Create a file named `.env` in the project root:
```env
EMAIL_USER=aadipandey223@gmail.com
EMAIL_PASSWORD=your-16-char-app-password-here
```

Then install python-dotenv:
```bash
pip install python-dotenv
```

Add to the top of `app.py`:
```python
from dotenv import load_dotenv
load_dotenv()
```

### 3. Restart the Backend

After setting the environment variables, restart the Flask backend:
```bash
python app.py
```

### 4. Test the Feedback

1. Log in as a patient
2. Go to Settings
3. Fill out the feedback form
4. Click "Send Feedback"
5. Check your email at `aadipandey223@gmail.com`

## Email Features

The feedback emails include:
- ✅ **Sender information**: Name, email, and role (Patient/Doctor)
- ✅ **Subject line**: From feedback form
- ✅ **Message**: Full feedback message
- ✅ **HTML formatting**: Beautiful styled email
- ✅ **Reply-To**: Set to sender's email for easy replies
- ✅ **Plain text fallback**: For email clients that don't support HTML

## Troubleshooting

### Issue: "EMAIL_PASSWORD not set" warning in console
**Solution**: Follow steps 1-2 above to set the environment variable

### Issue: "SMTP Authentication Error"
**Solutions**:
1. Make sure you're using an **App Password**, not your regular Gmail password
2. Remove spaces from the 16-character app password when setting it
3. Verify 2-Step Verification is enabled on your Google Account

### Issue: "Connection timeout"
**Solutions**:
1. Check your firewall settings - allow outbound connections to `smtp.gmail.com:587`
2. Try using port 465 with SSL instead (modify code if needed)
3. Check if your network blocks SMTP

### Issue: Email goes to spam
**Solutions**:
1. Mark the first email as "Not Spam" in Gmail
2. Add the sender to your contacts
3. For production, use a professional email service (SendGrid, AWS SES, etc.)

## Security Notes

⚠️ **NEVER commit `.env` file or app passwords to Git!**

Add to `.gitignore`:
```
.env
*.env
```

## For Production

For production deployment, consider using:
- **SendGrid**: Free tier includes 100 emails/day
- **AWS SES**: Very low cost, high reliability
- **Mailgun**: Good for transactional emails
- **Postmark**: Excellent deliverability

These services don't require storing passwords and provide better deliverability.

## Current Status

✅ Email sending code is implemented
✅ HTML email templates are ready
✅ Error handling is in place
⏸️ Waiting for EMAIL_PASSWORD environment variable to be set

Once you set the `EMAIL_PASSWORD` environment variable and restart the backend, feedback emails will be sent automatically!
