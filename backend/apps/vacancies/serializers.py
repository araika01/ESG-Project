from rest_framework import serializers
from .models import Vacancy, Favorite

class VacancyListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='employer.company_name', read_only=True)
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Vacancy
        fields = [
            'id', 'title', 'location', 'is_remote',
            'salary_min', 'salary_max', 'currency',
            'duration', 'replacement_reason',
            'status', 'is_urgent',
            'company_name',
            'description',          
            'requirements',         
            'department',           
            'skills_required', 
            'created_at', 'is_favorited'
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, vacancy=obj).exists()
        return False


class VacancyDetailSerializer(serializers.ModelSerializer):
    employer_details = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Vacancy
        fields = '__all__'
    
    def get_employer_details(self, obj):
        return {
            'id': obj.employer.id,
            'name': obj.employer.get_full_name(),
            'company_name': obj.employer.company_name,
            'rating': obj.employer.rating,
        }
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, vacancy=obj).exists()
        return False


class VacancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vacancy
        fields = [
            'title', 'description', 'requirements',
            'skills_required',
            'location', 'is_remote',
            'salary_min', 'salary_max', 'currency',
            'duration', 'replacement_reason',
            'department', 'is_urgent'
        ]
    
    def validate(self, data):
        if data.get('salary_min') and data.get('salary_max'):
            if data['salary_min'] > data['salary_max']:
                raise serializers.ValidationError({
                    'salary': 'Minimum salary cannot be greater than maximum.'
                })
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['employer'] = user
        
        if user.role in ['hr_manager', 'employer']:
            validated_data['status'] = 'open'
            validated_data['manager_approved'] = True
        else:
            validated_data['status'] = 'pending_approval'
            validated_data['manager_approved'] = False
        
        return super().create(validated_data)