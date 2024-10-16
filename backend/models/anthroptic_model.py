import anthropic
from typing import List, Dict, Iterable

class AnthropicClient:
    def __init__(self, api_key: str, model_name: str = "claude-v1"):
        self.client = anthropic.Anthropic(api_key=api_key)
        self._model_name = model_name

    def generate(self, messages: List[Dict], content: str) -> Iterable:
        messages.append({"role": "user", "content": content})
        stream = self.client.messages.create(
            messages=messages,
            model=self._model_name,
            max_tokens=1000,
            stream=True,
        )
        for event in stream:
            if getattr(event, 'text'):
                yield event.text
                
