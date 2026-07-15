# apps/core/models.py
from django.db import models
from django.utils import timezone
import uuid

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
        ordering = ['-created_at']


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        abstract = True


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)
    
    def with_deleted(self):
        return super().get_queryset()
    
    def only_deleted(self):
        return super().get_queryset().filter(deleted_at__isnull=False)


class SoftDeleteModel(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()  
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])
    
    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
    
    def restore(self):
        self.deleted_at = None
        self.save(update_fields=['deleted_at'])
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None


class BaseModel(TimeStampedModel, SoftDeleteModel):
    class Meta:
        abstract = True