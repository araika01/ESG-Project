import os
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ChatBotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '')
        if not user_message.strip():
            return Response({'reply': 'Please ask a question.'})

        
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            reply = self.gemini_chat(user_message, api_key)
            if reply:
                return Response({'reply': reply})

       
        reply = self.local_chat(user_message)
        return Response({'reply': reply})

    def gemini_chat(self, message, api_key):
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            prompt = (
                "You are a helpful assistant on a temporary work replacement platform called TempWork. "
                "Users can find temporary vacancies (due to maternity, sick leave, etc.), apply with resumes, "
                "communicate via chat, and employers can post vacancies and review candidates. "
                "Your job is to answer questions about using the platform, explain features, and give tips. "
                "Keep responses concise and friendly. Now answer this: " + message
            )
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini error: {e}")
            return None

    def local_chat(self, message):
        msg = message.lower()
        if any(word in msg for word in ['hello', 'hi', 'hey']):
            return 'Hello! How can I help you?'
        if any(word in msg for word in ['vacancy', 'job', 'position']):
            return 'You can find matching vacancies on the "Find Jobs" tab.'
        if any(word in msg for word in ['resume', 'cv']):
            return 'Create a resume in the Resumes section so employers can find you.'
        if any(word in msg for word in ['apply', 'application']):
            return 'Click "Apply" on the vacancy page to submit your application.'
        if any(word in msg for word in ['skill', 'skills']):
            return 'Add skills to your profile to improve job matching.'
        return 'I understand your question, but I can only help with basic topics right now. Try the "Find Jobs" or "Find Talent" tabs.'