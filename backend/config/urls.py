from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.vacancies.urls')),
    path('api/', include('apps.applications.urls')),
    path('api/', include('apps.resumes.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.messaging.urls')),
    path('api/', include('apps.matching.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
