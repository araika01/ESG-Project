from django.urls import path
from .views import MatchVacanciesView, MatchCandidatesView
from .bot_views import ChatBotView

urlpatterns = [
    path('match/vacancies/', MatchVacanciesView.as_view(), name='match-vacancies'),
    path('match/candidates/', MatchCandidatesView.as_view(), name='match-candidates'),
    path('bot/chat/', ChatBotView.as_view(), name='bot-chat'),
]