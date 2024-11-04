from django.urls import path
from .views import (
    DeceasedPersonCreateView,
    DeceasedPersonDetailView,
    DeceasedPersonListCreateView,
    ReviewListView,
    ReviewCreateView,
    ReviewApproveView,
    ReviewDeleteView,
)
from .views import DeceasedPersonUpdateView

urlpatterns = [
    path(
        "deceased/", DeceasedPersonListCreateView.as_view(), name="deceased-list-create"
    ),
    path(
        "deceased/<int:pk>/", DeceasedPersonDetailView.as_view(), name="deceased-detail"
    ),
    path("deceased/add/", DeceasedPersonCreateView.as_view(), name="deceased-add"),
    path(
        "deceased/<int:pk>/update/",
        DeceasedPersonUpdateView.as_view(),
        name="deceased-update",
    ),
    # http://127.0.0.1:8000/api/deceased/?all=true
    path("deceased/reviews/", ReviewListView.as_view(), name="deceased-reviews"),
    path(
        "deceased/<int:pk>/reviews/", ReviewListView.as_view(), name="deceased-reviews"
    ),
    path(
        "deceased/<int:pk>/reviews/add/", ReviewCreateView.as_view(), name="add-review"
    ),
    path(
        "deceased/reviews/<int:pk>/approve/",
        ReviewApproveView.as_view(),
        name="approve-review",
    ),
    path(
        "deceased/reviews/<int:pk>/",
        ReviewDeleteView.as_view(),
        name="delete_review",
    ),
]
