from django.contrib import admin

# from .models import Timeline, DeceasedTimeline
from .models import Timeline, DeceasedTimeline, FamilyAlbum

admin.site.register(Timeline)
admin.site.register(DeceasedTimeline)

admin.site.register(FamilyAlbum)
