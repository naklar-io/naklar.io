from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from knox import auth

from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="naklario-API",
        default_version='v1',
        description="T",
        terms_of_service="",
        contact=openapi.Contact(email="info@naklar.io"),
        license=openapi.License(name="BSD License"),
    ),
    public=False,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=(auth.TokenAuthentication,)
)
urlpatterns = [
    re_path(r'swagger?P<format>(\.json|\.yaml)^', schema_view.without_ui(
        cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger',
                                         cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc',
                                       cache_timeout=0), name='schema-redoc'),
    path('landing/', include('landing.urls')),
    path('account/', include('account.urls')),
    path('roulette/', include('roulette.urls')),
    path('admin/', admin.site.urls),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
