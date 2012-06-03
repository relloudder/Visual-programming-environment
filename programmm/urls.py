from django.conf.urls.defaults import patterns, include, url
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = patterns('django.views.generic.simple',
    (r'^$', 'direct_to_template', {'template': 'index.html'}),
    (r'^about/$', 'direct_to_template', {'template': 'about_en.html'}),
    (r'^about-ru/$', 'direct_to_template', {'template': 'about_ru.html'}),
)

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
