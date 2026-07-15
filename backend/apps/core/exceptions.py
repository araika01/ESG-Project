from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):

    response = exception_handler(exc, context)
    
    if response is None:
        logger.error(f"Unexpected error: {exc}", exc_info=True)
        return Response({
            'success': False,
            'error': {
                'type': 'ServerError',
                'message': 'An unexpected error occurred. Please try again later.',
                'detail': str(exc) if settings.DEBUG else None
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if response is not None:
        error_data = {
            'success': False,
            'error': {
                'type': exc.__class__.__name__,
                'message': str(exc),
                'detail': response.data if hasattr(response, 'data') else None
            }
        }
        
        if isinstance(exc, (DjangoValidationError, DRFValidationError)):
            if hasattr(exc, 'detail'):
                error_data['error']['fields'] = exc.detail
            elif hasattr(exc, 'message_dict'):
                error_data['error']['fields'] = exc.message_dict
        
        response.data = error_data
    
    return response


class APIException(Exception):
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = 'A server error occurred.'
    default_code = 'error'
    
    def __init__(self, message=None, code=None, status_code=None):
        if message is not None:
            self.message = message
        else:
            self.message = self.default_message
        
        if code is not None:
            self.code = code
        else:
            self.code = self.default_code
        
        if status_code is not None:
            self.status_code = status_code


class ResourceNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_message = 'The requested resource was not found.'
    default_code = 'not_found'


class PermissionDeniedException(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_message = 'You do not have permission to perform this action.'
    default_code = 'permission_denied'


class ValidationException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = 'Invalid input data.'
    default_code = 'validation_error'
    
    def __init__(self, message=None, fields=None, **kwargs):
        super().__init__(message, **kwargs)
        self.fields = fields or {}


class ConflictException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_message = 'Resource conflict occurred.'
    default_code = 'conflict'