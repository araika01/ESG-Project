from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']