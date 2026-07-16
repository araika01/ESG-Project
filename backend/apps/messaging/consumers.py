import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Отложенный импорт моделей и проверка авторизации
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = self.scope.get('user')
        if not user or user.is_anonymous:
            await self.close()
            return

        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        tempId = data.get('tempId')
        sender = self.scope['user']

        # Сохраняем сообщение в БД (импорт моделей внутри)
        msg = await self.save_message(sender, message)

        # Отправляем всем в группе
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_name': sender.get_full_name() or sender.email,
                'sender_id': sender.id,
                'tempId': tempId,
                'msgId': msg.id,
                'created_at': msg.created_at.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, sender, message):
        # Импорт моделей здесь, когда Django уже загружен
        from .models import Message, Conversation
        conversation = Conversation.objects.get(id=self.conversation_id)
        return Message.objects.create(
            conversation=conversation,
            sender=sender,
            text=message
        )