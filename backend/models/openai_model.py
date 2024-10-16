import os
from typing import List, Dict, Iterable
from openai import OpenAI


class OpenAIClient:
    def __init__(self, api_key: str, model_name: str = "gpt-3.5-turbo"):
        
        self.client = OpenAI(api_key=api_key)
        self._model_name = model_name

    def generate_response(self, messages : List[Dict], content : str) -> Iterable:
        
        system_message_exists = any(message['role'] == 'system' for message in messages)
        if not system_message_exists:
            messages.insert(0, {"role": "system", "content": "You are a helpful assistant."})
        
        messages.append({"role" : "user", "content" : content})
        
        response = self.client.chat.completions.create(
                model=os.getenv("", "gpt-3.5-turbo"),
                messages=messages,
                stream=True
            )
        
        for chunk in response:
            yield chunk.choices[0].delta.content

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def max_tokens(self) -> int:
        # This is an approximation, as it may vary by model
        return 4096
