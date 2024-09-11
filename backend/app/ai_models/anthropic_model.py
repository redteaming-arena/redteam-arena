from abc import ABC, abstractmethod
from typing import List, Dict, Any, Iterable
import anthropic

class AnthropicClient:
    def __init__(self, 
                 api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)

    def generate(self, 
                 messages: List[Dict], 
                 model : str) -> Iterable:  
        stream = self.client.messages.create(
            messages=messages, # Cut off system prompt
            model=model,
            max_tokens=1000,
            stream=True,
        )
        for event in stream:
            if event.type == 'content_block_delta':
                yield event.delta.text # event.content
                

    def __call__(self, *args: Any, **kwds: Any) -> Iterable:
        return self.generate(*args, **kwds)
                