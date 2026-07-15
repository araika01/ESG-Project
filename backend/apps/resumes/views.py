from rest_framework import viewsets, permissions
from .models import Resume
from .serializers import ResumeSerializer

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['employer', 'hr_manager']:
            return Resume.objects.filter(is_active=True)
        return Resume.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)