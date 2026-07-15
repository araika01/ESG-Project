# apps/vacancies/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Vacancy, Favorite
from .serializers import (
    VacancyListSerializer,
    VacancyDetailSerializer,
    VacancySerializer
)

class VacancyViewSet(viewsets.ModelViewSet):
    queryset = Vacancy.objects.select_related('employer').all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location', 'department', 'skills_required']
    ordering_fields = ['created_at', 'salary_min']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VacancyListSerializer
        elif self.action == 'retrieve':
            return VacancyDetailSerializer
        return VacancySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'apply', 'favorite']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            queryset = queryset.filter(status='open', manager_approved=True)
        
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        duration = self.request.query_params.get('duration')
        if duration:
            queryset = queryset.filter(duration=duration)
        
        reason = self.request.query_params.get('replacement_reason')
        if reason:
            queryset = queryset.filter(replacement_reason=reason)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        vacancy = self.get_object()
        user = request.user
        
        if vacancy.status != 'open':
            return Response({'error': 'Vacancy is not open'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.applications.models import Application
        from apps.notifications.models import Notification
        
        if Application.objects.filter(vacancy=vacancy, applicant=user).exists():
            return Response({'error': 'Already applied'}, status=status.HTTP_400_BAD_REQUEST)
        
        resume_id = request.data.get('resume_id')
        cover_letter = request.data.get('cover_letter', '')

        app = Application(
            vacancy=vacancy,
            applicant=user,
            cover_letter=cover_letter,
            status='pending'
            )
        if resume_id:
            from apps.resumes.models import Resume
            app.resume = Resume.objects.get(id=resume_id)
            app.save()

        from apps.messaging.models import Conversation

        conv = Conversation.objects.create(application=app)
        conv.participants.add(user, vacancy.employer)

        from apps.messaging.models import Message
        Message.objecs.create(
            conversation=conv,
            sender=conv,
            text=f"Applied for {vacancy.title}" + (f"\nCover letter: {cover_letter}" if cover_letter else "")
        )

        Notification.objects.create(
        user=vacancy.employer,
        type='application',
        title='New Application',
        message=f'{user.get_full_name()} applied for {vacancy.title}'
    )

        return Response({'status': 'application submitted'})
    
    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        vacancy = self.get_object()
        favorite, created = Favorite.objects.get_or_create(user=request.user, vacancy=vacancy)
        if not created:
            favorite.delete()
            return Response({'status': 'removed'})
        return Response({'status': 'added'})
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        favorites = Favorite.objects.filter(user=request.user).select_related('vacancy')
        vacancies = [f.vacancy for f in favorites]
        serializer = VacancyListSerializer(vacancies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my(self, request):
        vacancies = self.get_queryset().filter(employer=request.user)
        serializer = VacancyListSerializer(vacancies, many=True)
        return Response(serializer.data)