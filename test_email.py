"""
Test email sending configuration
Run this to test if email setup works before using the actual feedback form
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_email():
    """Test email sending with current configuration"""
    
    # Check environment variables
    email_user = os.getenv('EMAIL_USER', 'aadipandey223@gmail.com')
    email_password = os.getenv('EMAIL_PASSWORD', '')
    
    print("=" * 60)
    print("TESTING EMAIL CONFIGURATION")
    print("=" * 60)
    print(f"Email User: {email_user}")
    print(f"Password Set: {'Yes ✅' if email_password else 'No ❌'}")
    print()
    
    if not email_password:
        print("❌ EMAIL_PASSWORD environment variable is not set!")
        print()
        print("To fix this:")
        print("1. Go to https://myaccount.google.com/security")
        print("2. Enable 2-Step Verification")
        print("3. Create an App Password for 'Mail'")
        print("4. Set the environment variable:")
        print()
        print("   Windows PowerShell:")
        print("   $env:EMAIL_PASSWORD = 'your-app-password-here'")
        print()
        print("   Linux/Mac:")
        print("   export EMAIL_PASSWORD='your-app-password-here'")
        print()
        return False
    
    # Try to send test email
    try:
        print("Attempting to send test email...")
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Medicare Portal - Test Email"
        msg['From'] = "Medicare Portal <noreply@medicare.com>"
        msg['To'] = email_user
        
        text_content = """
        This is a test email from Medicare Portal.
        
        If you're seeing this, your email configuration is working correctly!
        
        You can now receive feedback emails from patients and doctors.
        """
        
        html_content = """
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 10px;">
                <h2 style="color: #8B5CF6;">✅ Email Test Successful!</h2>
                <p>This is a test email from <strong>Medicare Portal</strong>.</p>
                <p>If you're seeing this, your email configuration is working correctly!</p>
                <p>You can now receive feedback emails from patients and doctors.</p>
                <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                    This test was sent from: <code>test_email.py</code>
                </p>
            </div>
        </body>
        </html>
        """
        
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP('smtp.gmail.com', 587, timeout=10) as server:
            print("Connecting to Gmail SMTP server...")
            server.starttls()
            print("Logging in...")
            server.login(email_user, email_password)
            print("Sending email...")
            server.send_message(msg)
        
        print()
        print("=" * 60)
        print("✅ SUCCESS! Test email sent successfully!")
        print("=" * 60)
        print(f"Check your inbox at: {email_user}")
        print()
        return True
        
    except smtplib.SMTPAuthenticationError:
        print()
        print("=" * 60)
        print("❌ AUTHENTICATION FAILED")
        print("=" * 60)
        print("The email/password combination is incorrect.")
        print()
        print("Make sure you're using a Gmail App Password, not your regular password.")
        print("Create one at: https://myaccount.google.com/apppasswords")
        print()
        return False
        
    except Exception as e:
        print()
        print("=" * 60)
        print("❌ ERROR")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print()
        return False

if __name__ == "__main__":
    success = test_email()
    
    if success:
        print("🎉 Your email is ready to use!")
        print("Start the backend with: python app.py")
    else:
        print("❌ Email setup is not complete. Follow the instructions above.")
    
    input("\nPress Enter to exit...")
