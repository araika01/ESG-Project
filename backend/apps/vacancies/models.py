from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.core.models import TimeStampedModel

class Vacancy(TimeStampedModel):
    class ReplacementReason(models.TextChoices):
        MATERNITY = 'maternity', _('Maternity Leave')
        SICK = 'sick', _('Sick Leave')
        PERSONAL = 'personal', _('Personal Leave')
        TRAINING = 'training', _('Training/Internship')
        OTHER = 'other', _('Other')
    
    class Duration(models.TextChoices):
        UPTO_WEEK = '1_week', _('Up to 1 week')
        UPTO_MONTH = '1_month', _('1 week - 1 month')
        ONE_TO_THREE = '1_3_months', _('1-3 months')
        THREE_TO_SIX = '3_6_months', _('3-6 months')
        SIX_TO_TWELVE = '6_12_months', _('6-12 months')
        MORE_THAN_YEAR = '1_year_plus', _('More than 1 year')
    
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PENDING = 'pending_approval', _('Pending Approval')
        OPEN = 'open', _('Open')
        CLOSED = 'closed', _('Closed')
        CANCELLED = 'cancelled', _('Cancelled')
    
    employer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vacancies')
    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'))
    
    requirements = models.TextField(_('requirements'), blank=True)
    skills_required = models.JSONField(_('required skills'), default=list, blank=True)
    
    location = models.CharField(_('location'), max_length=255, blank=True)
    is_remote = models.BooleanField(_('remote work'), default=False)
    
    salary_min = models.DecimalField(_('minimum salary'), max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(_('maximum salary'), max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(_('currency'), max_length=3, default='KZT')
    
    duration = models.CharField(_('duration'), max_length=20, choices=Duration.choices, default='1_month')
    replacement_reason = models.CharField(_('replacement reason'), max_length=20, choices=ReplacementReason.choices, default='other')
    
    status = models.CharField(_('status'), max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    manager_approved = models.BooleanField(_('manager approved'), default=False)
    
    department = models.CharField(_('department'), max_length=255, blank=True)
    is_urgent = models.BooleanField(_('urgent'), default=False)
    
    class Meta:
        verbose_name = _('vacancy')
        verbose_name_plural = _('vacancies')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'vacancy']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.vacancy.title}"