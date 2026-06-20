from app.config import settings


async def send_email(to: str, subject: str, body: str):
    if not settings.smtp_username:
        print(f"[Email skipped] To: {to}, Subject: {subject}")
        return
    try:
        import aiosmtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.smtp_from
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))
        await aiosmtplib.send(
            msg, hostname=settings.smtp_host, port=settings.smtp_port,
            username=settings.smtp_username, password=settings.smtp_password, start_tls=True)
    except Exception as exc:
        print(f"Email send failed: {exc}")


async def send_password_reset_email(email: str, token: str):
    link = f"{settings.frontend_url}/reset-password?token={token}"
    body = f"<p>Click <a href='{link}'>here</a> to reset your password. Expires in 1 hour.</p>"
    await send_email(email, "Password Reset Request", body)
