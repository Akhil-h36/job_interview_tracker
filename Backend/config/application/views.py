from django.shortcuts import render
from .models import jobapplication
from .serializers import jobapplictionserializer
from rest_framework.response import Response
from rest_framework.decorators import api_view
from datetime import date
from django.db.models import Sum
# Create your views here.


@api_view(['GET'])
def get_applicationrecodes(requset):
    data=jobapplication.objects.all()
    serializer=jobapplictionserializer(data,many=True)
    return Response(serializer.data)


@api_view(['POST'])
def apply_job(request):
    platform=request.data.get('platform')
    today=date.today()

    obj,created=jobapplication.objects.get_or_create(date=today)
    if platform=="linkedin":
        obj.linkedin_count+=1
    elif platform=="indeed":
        obj.indeed_count+=1
    elif platform=="naukri":
        obj.naukari_count+=1

    obj.save()

    return Response({"message":"the applicationo data is enterd"})

@api_view(['GET'])
def dashboard_stats(request):
    data=jobapplication.objects.aggregate(linkedin_total=Sum('linkedin_count'),indeed_total=Sum('indeed_count'),naukri_total=Sum('naukari_count'))


    total = (
        (data['linkedin_total'] or 0)+
        (data['indeed_total'] or 0)+
        (data['naukri_total'] or 0)
    )

    return Response({
    "overall_total": total,
    "linkedin_total": data['linkedin_total'] or 0,
    "indeed_total": data['indeed_total'] or 0,
    "naukri_total": data['naukri_total'] or 0,
})

@api_view(['POST'])
def set_count(request):
    """Overwrite today's count for a platform to a specific value."""
    platform = request.data.get('platform')
    count = request.data.get('count')

    if count is None or int(count) < 0:
        return Response({"error": "Invalid count"}, status=400)

    today = date.today()
    obj, created = jobapplication.objects.get_or_create(date=today)

    if platform == "linkedin":
        obj.linkedin_count = int(count)
    elif platform == "indeed":
        obj.indeed_count = int(count)
    elif platform == "naukri":
        obj.naukari_count = int(count)
    else:
        return Response({"error": "Invalid platform"}, status=400)

    obj.save()
    return Response({"message": f"{platform} count set to {count}."})


@api_view(['DELETE'])
def reset_all(request):
    """Delete every job application record — requires confirmation from frontend."""
    deleted_count, _ = jobapplication.objects.all().delete()
    return Response({"message": f"All records deleted.", "deleted": deleted_count})



@api_view(['GET'])
def get_daywise_report(request,date):
   

    obj = jobapplication.objects.filter(date=date).first()
    if not obj:
        return Response({"error": "No data for this date"}, status=404)
    serializers=jobapplictionserializer(obj)
    return Response(serializers.data)

 