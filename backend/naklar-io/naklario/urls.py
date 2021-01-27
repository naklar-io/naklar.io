from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from knox import auth
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication

from naklario import views

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
    authentication_classes=(auth.TokenAuthentication, SessionAuthentication)
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
    path('notify/', include('notify.urls')),
    path('scheduling/', include('scheduling.urls')),
    path('admin/', admin.site.urls),
    path('settings/', views.FrontendSettingsView.as_view())

]  # + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.ENABLE_DEBUG_TOOLBAR:
    import debug_toolbar

    urlpatterns.append(path('__debug__/', include(debug_toolbar.urls)))
