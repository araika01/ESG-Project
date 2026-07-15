# apps/core/throttling.py
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.core.cache import cache

class CustomUserRateThrottle(UserRateThrottle):
    rate = '1000/hour'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
    
    def allow_request(self, request, view):
        if request.user.is_authenticated and request.user.role == 'admin':
            self.rate = '10000/hour'
        
        return super().allow_request(request, view)


class CustomAnonRateThrottle(AnonRateThrottle):
    rate = '100/hour'


class BurstRateThrottle(UserRateThrottle):
    scope = 'burst'
    rate = '60/minute'


class SustainedRateThrottle(UserRateThrottle):
    scope = 'sustained'
    rate = '1000/day'