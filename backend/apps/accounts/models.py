from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        EMPLOYEE = 'employee', 'Employee'
        EMPLOYER = 'employer', 'Employer'
        HR_MANAGER = 'hr_manager', 'HR Manager'
    
    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        OTHER = 'other', 'Other'
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default='employee')
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    position = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    skills = models.JSONField(default=list, blank=True)
    bio = models.TextField(max_length=1000, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    rating = models.FloatField(default=0.0)
    total_reviews = models.IntegerField(default=0)
    available_for_work = models.BooleanField(default=True)
    remote_work = models.BooleanField(default=False)
    profile_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def age(self):
        if self.date_of_birth:
            import datetime
            today = datetime.date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None