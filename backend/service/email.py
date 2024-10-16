import smtplib
import os
from email.message import EmailMessage
from api.database import TemporaryRegistration

SMTP_SERVER = os.getenv("SMTP_SERVER", 'smtp.gmail.com')
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your_email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your_password")
FROM_EMAIL = os.getenv("FROM_EMAIL", "your_email@gmail.com")
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

def send_magic_link(temp_user: TemporaryRegistration):
    print(SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, FROM_EMAIL, BASE_URL)
    subject = "Secure link to log in to redarena.ai"
    html_content = f"""
    <div style="background-color:#ffffff; font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
        <div style="text-align:center; padding:20px 0;">
            <div style="font-size:24px; font-weight:bold; color:#000000;">
                />
            </div>
        </div>
        <div style="text-align:center; padding:20px 0;">
            <h1 style="color:#000000; font-size:32px; margin-bottom:10px;">Let's get you signed in</h1>
            <p style="color:#000000; font-size:14px; margin-bottom:20px;">All you have to do is click this button and we'll sign you in with a secure link</p>
            <a href="{BASE_URL}/magic_link?token={temp_user.registration_token}" style="background-color:#000000; color:#ffffff; padding:12px 20px; text-decoration:none; font-weight:bold; display:inline-block; border-radius:5px;">Sign in to RedArena</a>
        </div>
        <div style="text-align:center; color:#000000; font-size:12px; margin-top:20px;">
            <p>If you didn't request this email, you can safely ignore it.</p>
        </div>
    </div>
    """
    
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = FROM_EMAIL
    msg['To'] = temp_user.email
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"Magic link sent to {temp_user.email}")
        return {"message": f"Magic link sent to {temp_user.email}", "success": True}
    except smtplib.SMTPConnectError as e:
        print(f"SMTP Connection Error: {str(e)}")
        return {"message": f"Failed to connect to the SMTP server. Error: {str(e)}", "success": False}
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {str(e)}")
        return {"message": "Failed to authenticate with the SMTP server. Please check your credentials.", "success": False}
    except smtplib.SMTPException as e:
        print(f"SMTP Error: {str(e)}")
        return {"message": f"An SMTP error occurred: {str(e)}", "success": False}
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {"message": f"An unexpected error occurred: {str(e)}", "success": False}

def send_reset_password(email: str):
    # Implementation for password reset...
    pass