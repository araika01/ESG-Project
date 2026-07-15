from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from rest_framework.validators import UniqueValidator

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'username', 'first_name', 'last_name',
            'role', 'company_name', 'position'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match'
            })
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    age = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'full_name',
            'first_name', 'last_name', 'phone',
            'role', 'gender', 'age', 'date_of_birth',
            'company_name', 'position', 'department',
            'experience_years', 'skills', 'bio',
            'avatar', 'rating', 'total_reviews',
            'available_for_work', 'remote_work',
            'created_at'
        ]
        read_only_fields = ['email', 'rating', 'total_reviews', 'created_at']
        extra_kwargs = {
            'username': {'required': False},
        }
    
    def get_full_name(self, obj):
        return obj.get_full_name()
