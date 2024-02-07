from django.urls import path
from apps.finance.views import LoonAccountView, LoonAccountDetailView, LoonCapitalFlowView

urlpatterns = [
    path('/account', LoonAccountView.as_view()),
    path('/account/<int:account_id>', LoonAccountDetailView.as_view()),
    path('/capitalflow', LoonCapitalFlowView.as_view()),
]