import os
from typing import List, Dict, Any, Iterable
import google.generativeai as genai
import json

class GeminiClient:
    def __init__(self, api_key: str):
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        self.safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

    def generate(self,
                 messages: List[Dict],
                 model: str,
                 functions: List[Dict]) -> Iterable:
        model = genai.GenerativeModel(
            model_name=model,
            safety_settings=self.safety_settings,
        )
        _converted_message = self._convert_messages(messages)
        chat = model.start_chat(
            history=_converted_message[:-1],
        )
        response = chat.send_message(_converted_message[-1], stream=True)
        for chunk in response:
            content = chunk.candidates[0].content.parts[0].text
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict) and "function_call" in parsed:
                    yield json.dumps(parsed)
                else:
                    yield content
            except (json.JSONDecodeError, TypeError):
                yield content

    def _convert_messages(self, messages: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        gemini_messages = []
        for message in messages:
            role = message['role']
            content = message['content']
            
            if role == 'system':
                # Gemini doesn't have a system role, so we'll prepend it to the first user message
                if gemini_messages and gemini_messages[0]['role'] == 'user':
                    gemini_messages[0]['parts'][0] = f"{content}\n\n{gemini_messages[0]['parts'][0]}"
                else:
                    gemini_messages.append({"role": "user", "parts": [content]})
            elif role in ['user', 'model']:
                gemini_messages.append({"role": role, "parts": [content]})
        
        return gemini_messages

    def __call__(self, *args: Any, **kwds: Any) -> Iterable:
        return self.generate(*args, **kwds)