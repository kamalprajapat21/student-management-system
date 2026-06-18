import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings
import logging

logger = logging.getLogger(__name__)


async def send_email(to_email: str, subject: str, html_body: str, plain_body: str = None):
    if not settings.smtp_username:
        logger.warning("SMTP not configured. Email not sent.")
        return False
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.smtp_from
        message["To"] = to_email

        if plain_body:
            message.attach(MIMEText(plain_body, "plain"))
        message.attach(MIMEText(html_body, "html"))

        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            start_tls=True,
        )
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_password_reset_email(email: str, name: str, token: str):
    from app.config import settings as cfg
    reset_link = f"{cfg.frontend_url}/reset-password?token={token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="{reset_link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reset Password
        </a>
        <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Student Management System</p>
    </div>
    """
    await send_email(email, "Password Reset - Student Management System", html)


async def send_attendance_alert(email: str, name: str, percentage: float):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Low Attendance Alert</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>Your current attendance is <strong style="color: #dc2626;">{percentage}%</strong>, which is below the required 75%.</p>
        <p>Please attend classes regularly to avoid academic consequences.</p>
        <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <strong>Current Status:</strong> {'⚠️ Warning' if percentage >= 60 else '🔴 Critical'}<br>
            <strong>Required:</strong> 75%<br>
            <strong>Your Attendance:</strong> {percentage}%
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">Student Management System</p>
    </div>
    """
    await send_email(email, "Low Attendance Alert", html)


async def send_fee_reminder(email: str, name: str, fee_type: str, amount: float, due_date: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">💰 Fee Payment Reminder</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>This is a reminder that your fee payment is due soon.</p>
        <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <strong>Fee Type:</strong> {fee_type}<br>
            <strong>Amount Due:</strong> ₹{amount}<br>
            <strong>Due Date:</strong> {due_date}
        </div>
        <p>Please make the payment before the due date to avoid late fees.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Student Management System</p>
    </div>
    """
    await send_email(email, f"Fee Payment Reminder - {fee_type}", html)


async def send_exam_notification(email: str, name: str, exam_title: str, subject: str, exam_date: str, start_time: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">📚 Exam Notification</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>Reminder: Your exam is scheduled soon.</p>
        <div style="background: #f5f3ff; border: 1px solid #c4b5fd; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <strong>Exam:</strong> {exam_title}<br>
            <strong>Subject:</strong> {subject}<br>
            <strong>Date:</strong> {exam_date}<br>
            <strong>Time:</strong> {start_time}
        </div>
        <p>Best of luck with your preparation!</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Student Management System</p>
    </div>
    """
    await send_email(email, f"Exam Reminder: {exam_title}", html)
