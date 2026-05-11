import smtplib
from email.message import EmailMessage
from app.core.config import settings


def _send(to_email: str, subject: str, html_body: str):
    """Core send function using SMTP."""
    if not settings.MAIL_USERNAME:
        print(f"[EMAIL SKIPPED — no SMTP config] To: {to_email} | Subject: {subject}")
        return

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = settings.MAIL_FROM
        msg["To"] = to_email
        msg.set_content(html_body, subtype="html")

        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as smtp:
            smtp.starttls()
            smtp.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            smtp.send_message(msg)
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")


def send_otp_email(email: str, name: str, otp: int):
    _send(
        email,
        "Verify your FUTO Marketplace account",
        f"""
        <h2>Welcome to FUTO Marketplace, {name}!</h2>
        <p>Your verification code is:</p>
        <h1 style="color:#2563EB; letter-spacing:8px">{otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't register, ignore this email.</p>
        """
    )


def send_order_email(email: str, name: str, event: str, item_title: str):
    messages = {
        "new_order": ("New Order Received", f"You have a new order for <b>{item_title}</b>. Please accept or decline in your dashboard."),
        "order_accepted": ("Order Accepted", f"Your order for <b>{item_title}</b> has been accepted. Arrange pickup or delivery with the seller."),
        "order_completed": ("Order Completed", f"Your order for <b>{item_title}</b> is complete. Don't forget to rate your seller!"),
        "order_cancelled": ("Order Cancelled", f"An order for <b>{item_title}</b> has been cancelled."),
    }
    subject, body = messages.get(event, ("FUTO Marketplace Update", f"Update on your order for {item_title}"))
    _send(email, subject, f"<p>Hi {name},</p><p>{body}</p><br><p>— FUTO Marketplace Team</p>")


def send_subscription_warning_email(email: str, name: str, days_left: int):
    _send(
        email,
        "Your FUTO Marketplace subscription is expiring soon",
        f"""
        <p>Hi {name},</p>
        <p>Your subscription expires in <b>{days_left} days</b>.</p>
        <p>Renew now to keep your listings active and continue selling.</p>
        <a href="{settings.FRONTEND_URL}/subscription" style="background:#2563EB;color:white;padding:10px 20px;border-radius:5px;text-decoration:none">Renew Subscription</a>
        <br><br><p>— FUTO Marketplace Team</p>
        """
    )


def send_password_reset_email(email: str, name: str, otp: int):
    _send(
        email,
        "Reset your FUTO Marketplace password",
        f"""
        <p>Hi {name},</p>
        <p>Your password reset code is:</p>
        <h1 style="color:#2563EB; letter-spacing:8px">{otp}</h1>
        <p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        """
    )