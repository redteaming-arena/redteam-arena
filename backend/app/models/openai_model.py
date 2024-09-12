from openai import OpenAI, models
from abc import ABC, abstractmethod
from typing import Any, List, Dict, Iterable, Callable



class OpenAIClient:
    def __init__(self, api_key: str, base_url: str = "https://api.openai.com/v1"):
        self.client = OpenAI(api_key=api_key, base_url=base_url)

    def generate(self, 
                 messages : List[Dict], 
                 model : str) -> Iterable:
        response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True
            )
        
        for chunk in response:
            yield chunk.choices[0].delta.content

    def __call__(self, *args: Any, **kwds: Any) -> Iterable:
        return self.generate(*args, **kwds)
        
