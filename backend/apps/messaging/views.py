from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).prefetch_related('messages')
    
    def perform_create(self, serializer):
        conversation = serializer.save()
        conversation.participants.add(self.request.user)
        
        participant_id = self.request.data.get('participant_id')
        if participant_id:
            from apps.accounts.models import CustomUser
            other_user = CustomUser.objects.get(id=participant_id)
            conversation.participants.add(other_user)
        
        application_id = self.request.data.get('application_id')
        if application_id:
            from apps.applications.models import Application
            conversation.application = Application.objects.get(id=application_id)
            conversation.save()
            
    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        conversation = self.get_object()
        user_id = request.data.get('user_id')
        from apps.accounts.models import CustomUser
        user = CustomUser.objects.get(id=user_id)
        conversation.participants.add(user)
        return Response({'status': 'participant added'})

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        conversation = self.get_object()
        text = request.data.get('text', '')
        
        if not text.strip():
            return Response({'error': 'Message cannot be empty'}, status=400)
        
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            text=text
        )
        
        conversation.messages.filter(sender=request.user).update(is_read=True)
        
        return Response(MessageSerializer(message).data)
    
    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        conversation = self.get_object()
        conversation.messages.exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'read'})