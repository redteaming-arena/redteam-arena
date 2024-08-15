# app/ai_models/openai_model.py
import openai
from openai import OpenAI
from .base import AIModel
from typing import AsyncGenerator

class OpenAIModel(AIModel):
    def __init__(self, api_key):
        self.client = OpenAI(api_key=api_key)

    def generate_response(self, conversation_history, user_input, stream=False) -> any:
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
        ]
        for chat in conversation_history:
            messages.append({"role": "user", "content": chat['user']})
            messages.append({"role": "assistant", "content": chat['model']})
        messages.append({"role": "user", "content": user_input})
        
        response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                stream=stream
            )
        return response
            