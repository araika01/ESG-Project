from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = [
        ('application', 'New Application'),
        ('status_change', 'Status Changed'),
        ('message', 'New Message'),
        ('review', 'New Review'),
        ('approval', 'Approval'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']