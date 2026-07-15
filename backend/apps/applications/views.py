from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Application
from .serializers import ApplicationSerializer, ApplicationCreateSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        return ApplicationSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Все видят свои отклики (где они applicant)
        queryset = Application.objects.filter(applicant=user)
        
        # Employer/HR также видят отклики на свои вакансии
        if user.role in ['employer', 'hr_manager']:
            employer_apps = Application.objects.filter(vacancy__employer=user)
            queryset = queryset | employer_apps
        
        return queryset.distinct()
    
    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        application = self.get_object()
        if request.user != application.vacancy.employer:
            return Response({'error': 'Not allowed'}, status=403)
        application.status = 'accepted'
        application.save()
        return Response({'status': 'accepted'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        application = self.get_object()
        if request.user != application.vacancy.employer:
            return Response({'error': 'Not allowed'}, status=403)
        application.status = 'rejected'
        application.save()
        return Response({'status': 'rejected'})