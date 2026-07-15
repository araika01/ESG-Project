from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)
    
    def get_queryset(self):
        if 'user' in self.request.query_params:
            return Review.objects.filter(reviewee_id=self.request.query_params['user'])
        return Review.objects.all()