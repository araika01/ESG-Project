from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'reviewee', 'application', 'rating', 'comment', 'reviewer_name', 'created_at']
        read_only_fields = ['reviewer', 'created_at']