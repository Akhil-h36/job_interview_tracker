from rest_framework import serializers
from .models import jobapplication


class jobapplictionserializer(serializers.ModelSerializer):
    class Meta:
        model=jobapplication
        fields='__all__'