# apps/core/mixins.py
from rest_framework import status
from rest_framework.response import Response
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie

class CreateModelMixin:
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'success': True,
                'message': 'Created successfully',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class UpdateModelMixin:
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        
        return Response({
            'success': True,
            'message': 'Updated successfully',
            'data': serializer.data
        })


class DeleteModelMixin:
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Deleted successfully'
        }, status=status.HTTP_200_OK)


class CacheMixin:
    cache_timeout = 60 * 15  # 15 minutes
    
    @method_decorator(cache_page(cache_timeout))
    @method_decorator(vary_on_cookie)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class MultiSerializerViewSetMixin:
    serializer_classes = {}
    
    def get_serializer_class(self):
        return self.serializer_classes.get(self.action, self.serializer_class)