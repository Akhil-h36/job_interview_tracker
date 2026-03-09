from django.db import models

# Create your models here.
class jobapplication(models.Model):
    date=models.DateField(unique=True)
    linkedin_count = models.IntegerField(default=0)
    indeed_count = models.IntegerField(default=0)
    naukari_count = models.IntegerField(default=0)

    def total_count(self):
        return self.linkedin_count+self.indeed_count+self.naukari_count

    def __str__(self):
        return str(self.date)