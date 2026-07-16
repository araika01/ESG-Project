from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.vacancies.models import Vacancy
from apps.resumes.models import Resume
from apps.accounts.models import CustomUser

class MatchVacanciesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_skills = set(user.skills or [])
        if not user_skills:
            return Response({"message": "Please add skills to your profile first."}, status=400)

        vacancies = Vacancy.objects.filter(status='open', manager_approved=True)
        matched = []
        for v in vacancies:
            required = set(v.skills_required or [])
            common = user_skills & required
            if common:
                score = len(common) / len(required) * 100 if required else 0
                matched.append({
                    "vacancy": {
                        "id": v.id,
                        "title": v.title,
                        "location": v.location,
                        "salary_min": v.salary_min,
                        "salary_max": v.salary_max,
                        "currency": v.currency,
                        "company_name": v.employer.company_name or "",
                        "skills_required": v.skills_required,
                    },
                    "match_percent": round(score, 1),
                    "common_skills": list(common),
                })
        matched.sort(key=lambda x: x['match_percent'], reverse=True)
        return Response({"results": matched[:10]})

class MatchCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        vacancy_id = request.data.get('vacancy_id')
        try:
            vacancy = Vacancy.objects.get(id=vacancy_id)
            
            if vacancy.employer != request.user:
                return Response({"error": "You are not the owner of this vacancy."}, status=403)
        except Vacancy.DoesNotExist:
            return Response({"error": "Vacancy not found."}, status=404)

        required_skills = set(vacancy.skills_required or [])
        if not required_skills:
            return Response({"message": "This vacancy has no required skills."}, status=400)

        resumes = Resume.objects.filter(is_active=True).select_related('user')
        matched = []
        for r in resumes:
            candidate_skills = set(r.skills or [])
            common = candidate_skills & required_skills
            if common:
                score = len(common) / len(required_skills) * 100
                matched.append({
                    "candidate": {
                        "id": r.user.id,
                        "name": r.user.get_full_name(),
                        "skills": r.skills,
                        "resume_id": r.id,
                        "resume_title": r.title,
                        "experience": r.experience,
                    },
                    "match_percent": round(score, 1),
                    "common_skills": list(common),
                })
        matched.sort(key=lambda x: x['match_percent'], reverse=True)
        return Response({"results": matched[:10]})