from django.urls import path
from .views import (
    TimelineListCreateView,
    TimelineDetailView,
    DeceasedTimelineListCreateView,
    DeceasedTimelineDetailView,
    DeceasedTimelineCreateView,
    DeceasedTimelineAPIView,
    FamilyAlbumListCreateView,
    FamilyAlbumListView,
)

urlpatterns = [
    # path("timeline/", TimelineListCreateView.as_view(), name="timeline-list-create"),
    path("timeline/<int:pk>/", TimelineDetailView.as_view(), name="timeline-detail"),
    # path(
    #     "deceased-timeline/",
    #     DeceasedTimelineListCreateView.as_view(),
    #     name="deceased-timeline-list-create",
    # ),
    path(
        "deceased-timeline/<int:pk>/",
        DeceasedTimelineDetailView.as_view(),
        name="deceased-timeline-detail",
    ),
    path("timeline/", TimelineListCreateView.as_view(), name="timeline-create"),
    path(
        "deceased-timeline/",
        DeceasedTimelineCreateView.as_view(),
        name="deceased-timeline-create",
    ),
    path(
        "details/<int:deceased_id>/",
        DeceasedTimelineAPIView.as_view(),
        name="deceased-timeline",
    ),
    path(
        "family-album/",
        FamilyAlbumListCreateView.as_view(),
        name="family-album-list-create",
    ),
    path(
        "family-album/<int:deceased_id>/",
        FamilyAlbumListView.as_view(),
        name="family-album-list",
    ),
]
