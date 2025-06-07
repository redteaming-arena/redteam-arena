from abc import ABC, abstractmethod
from typing import List, Dict, Any, Iterable
import anthropic
import json

class AnthropicClient:
    def __init__(self, 
                 api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)

    def generate(self,
                 messages: List[Dict],
                 model: str,
                 functions: List[Dict]) -> Iterable:
        prompt = ""
        for m in messages:
            if m["role"] == "system":
                prompt += f"\n\nHuman: {m['content']}"
            elif m["role"] == "user":
                prompt += f"\n\nHuman: {m['content']}"
            elif m["role"] == "assistant":
                prompt += f"\n\nAssistant: {m['content']}"

        stream = self.client.messages.create(
            model=model,
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ],
            stream=True,
        )

        for event in stream:
            if event.type == 'content_block_delta':
                content = event.delta.text
                try:
                    parsed = json.loads(content)
                    if isinstance(parsed, dict) and "function_call" in parsed:
                        yield json.dumps(parsed)
                    else:
                        yield content
                except (json.JSONDecodeError, TypeError):
                    yield content
                

    def __call__(self, *args: Any, **kwds: Any) -> Iterable:
        return self.generate(*args, **kwds)