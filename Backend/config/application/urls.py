from django.urls import path
from . import views


urlpatterns=[
    path('reset/', views.reset_all),    
    path('application/',views.get_applicationrecodes),
    path('apply/',views.apply_job),
    path('stats/',views.dashboard_stats),
    path('application/<str:date>',views.get_daywise_report),
    path('report/<str:date>/', views.get_daywise_report),
]