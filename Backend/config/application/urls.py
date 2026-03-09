from django.urls import path
from . import views


urlpatterns=[
    path('reset/', views.reset_all),    
    path('application/',views.get_application_records),
    path('apply/',views.apply_job),
    path('stats/',views.dashboard_stats),
    path('set-count/', views.set_count),
    path('application/<str:date>',views.get_daywise_report),
    path('report/<str:date>/', views.get_daywise_report),
]
