from django.shortcuts import render
from .models import jobapplication
from .serializers import jobapplictionserializer
from rest_framework.response import Response
from rest_framework.decorators import api_view
from datetime import date
from django.db.models import Sum


@api_view(['DELETE'])
def reset_all(request):
    """Delete every job application record — requires confirmation from frontend."""
    deleted_count, _ = jobapplication.objects.all().delete()
    return Response({"message": f"All records deleted.", "deleted": deleted_count})


@api_view(['GET'])
def get_application_records(request):
    data = jobapplication.objects.all()
    serializer = jobapplictionserializer(data, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def apply_job(request):
    platform = request.data.get('platform')
    today = date.today()

    obj, created = jobapplication.objects.get_or_create(date=today)

    if platform == "linkedin":
        obj.linkedin_count += 1
    elif platform == "indeed":
        obj.indeed_count += 1
    elif platform == "naukri":
        obj.naukari_count += 1
    else:
        return Response({"error": "Invalid platform"}, status=400)

    obj.save()
    return Response({"message": "Application count updated."})


@api_view(['POST'])
def set_count(request):
    """Add a specific number to today's count for a platform."""
    platform = request.data.get('platform')
    count = request.data.get('count')

    if count is None or int(count) < 0:
        return Response({"error": "Invalid count"}, status=400)

    today = date.today()
    obj, created = jobapplication.objects.get_or_create(date=today)

    if platform == "linkedin":
        obj.linkedin_count += int(count)
    elif platform == "indeed":
        obj.indeed_count += int(count)
    elif platform == "naukri":
        obj.naukari_count += int(count)
    else:
        return Response({"error": "Invalid platform"}, status=400)

    obj.save()
    return Response({"message": f"{platform} count increased by {count}."})


@api_view(['GET'])
def dashboard_stats(request):
    data = jobapplication.objects.aggregate(
        linkedin_total=Sum('linkedin_count'),
        indeed_total=Sum('indeed_count'),
        naukri_total=Sum('naukari_count')
    )

    linkedin = data['linkedin_total'] or 0
    indeed = data['indeed_total'] or 0
    naukri = data['naukri_total'] or 0
    total = linkedin + indeed + naukri

    return Response({
        "overall_total": total,
        "linkedin_total": linkedin,   # ✅ fixed: was returning indeed_total by mistake
        "indeed_total": indeed,
        "naukri_total": naukri,
    })


@api_view(['GET'])
def get_daywise_report(request, date):
    obj = jobapplication.objects.filter(date=date).first()

    if not obj:  # ✅ fixed: handle missing dates gracefully
        return Response({"error": "No data found for this date."}, status=404)

    serializer = jobapplictionserializer(obj)
    return Response(serializer.data)