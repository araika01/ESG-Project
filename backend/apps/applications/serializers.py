from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    vacancy_title = serializers.CharField(source='vacancy.title', read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['applicant', 'status', 'created_at']

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['vacancy', 'cover_letter']