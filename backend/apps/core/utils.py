# apps/core/utils.py
import hashlib
import uuid
from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import jwt
import random
import string

class TokenGenerator:
    
    @staticmethod
    def generate_email_verification_token(user):
        payload = {
            'user_id': user.id,
            'email': user.email,
            'type': 'email_verification',
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def generate_password_reset_token(user):
        payload = {
            'user_id': user.id,
            'email': user.email,
            'type': 'password_reset',
            'exp': datetime.utcnow() + timedelta(hours=1),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def verify_token(token, token_type):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            if payload['type'] != token_type:
                return None
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None


class EmailService:
    
    
    @staticmethod
    def send_welcome_email(user):
    
        subject = 'Welcome to TempWork Platform!'
        html_message = render_to_string('emails/welcome.html', {
            'user': user,
            'login_url': f"{settings.FRONTEND_URL}/login"
        })
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=True
        )
    
    @staticmethod
    def send_application_notification(employer, applicant, vacancy):
        
        subject = f'New Application: {vacancy.title}'
        html_message = render_to_string('emails/new_application.html', {
            'employer': employer,
            'applicant': applicant,
            'vacancy': vacancy,
            'dashboard_url': f"{settings.FRONTEND_URL}/applications"
        })
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [employer.email],
            html_message=html_message,
            fail_silently=True
        )


class FileHandler:
    
    @staticmethod
    def get_file_path(instance, filename):
        ext = filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        
        if hasattr(instance, 'user'):
            return f"uploads/{instance.user.id}/{filename}"
        return f"uploads/{filename}"
    
    @staticmethod
    def validate_file_size(value, max_size=5 * 1024 * 1024):
        if value.size > max_size:
            from django.core.exceptions import ValidationError
            raise ValidationError(f'File size cannot exceed {max_size/1024/1024}MB')
    
    @staticmethod
    def validate_file_extension(value, allowed_extensions):
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            from django.core.exceptions import ValidationError
            raise ValidationError(
                f'File type not supported. Allowed: {", ".join(allowed_extensions)}'
            )


class DataSanitizer:
    
    @staticmethod
    def sanitize_html(text):
        import re
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)
    
    @staticmethod
    def sanitize_string(text):
        import re
        return re.sub(r'[^\w\s-]', '', text).strip()
    
    @staticmethod
    def generate_unique_slug(text, model_class):
        from django.utils.text import slugify
        slug = slugify(text)
        unique_slug = slug
        num = 1
        
        while model_class.objects.filter(slug=unique_slug).exists():
            unique_slug = f"{slug}-{num}"
            num += 1
        
        return unique_slug