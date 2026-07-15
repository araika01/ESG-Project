from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

class IsOwnerOrReadOnly(permissions.BasePermission):

    message = "You must be the owner of this object to modify it."
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.owner == request.user


class IsEmployerOrReadOnly(permissions.BasePermission):
    
    message = "Only employers and HR managers can perform this action."
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_authenticated and \
               request.user.role in ['employer', 'hr_manager', 'admin']


class IsHRManager(permissions.BasePermission):
    
    message = "Only HR managers can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
               request.user.role in ['hr_manager', 'admin']


class IsOwnerOrAdmin(permissions.BasePermission):
    
    message = "You must be the owner or an admin to access this resource."
    
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False


class ReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class IsVerified(permissions.BasePermission):

    message = "Your account must be verified to perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified