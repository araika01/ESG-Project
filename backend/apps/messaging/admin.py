from django.contrib import admin
from .models import Conversation, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'application', 'created_at', 'updated_at']
    inlines = [MessageInline]

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'conversation', 'text_preview', 'is_read', 'created_at']
    list_filter = ['is_read']
    
    def text_preview(self, obj):
        return obj.text[:50]