from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'text', 'is_read', 'created_at']
        read_only_fields = ['sender']

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    other_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'application', 'messages', 'last_message', 'other_user', 'created_at']
    
    def get_last_message(self, obj):
        last = obj.messages.last()
        return MessageSerializer(last).data if last else None
    
    def get_other_user(self, obj):
        request = self.context.get('request')
        other = obj.participants.exclude(id=request.user.id).first()
        return {'id': other.id, 'name': other.get_full_name()} if other else None