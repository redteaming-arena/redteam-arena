from openai import OpenAI, models
from abc import ABC, abstractmethod
from typing import Any, List, Dict, Iterable, Callable

NO_REFUND_FUNCTION = {
    "name": "issue_refund",
    "description": "Issue a refund to the customer. When you decide to issue a refund to the customer, call this function with the confirmation number and the amount to refund.",
    "parameters": {
        "type": "object",
        "properties": {
            "confirmation_number": {
                "type": "string",
                "description": "Confirmation number of the order to be refunded."
            },
            "amount": {
                "type": "number",
                "description": "Amount of the refund to be issued."
            }
        },
        "required": ["confirmation_number", "amount"]
    }
}

class OpenAIClient:
    def __init__(self, api_key: str, base_url: str = "https://api.openai.com/v1"):
        self.client = OpenAI(api_key=api_key, base_url=base_url)

    def generate(self, 
                 messages : List[Dict],
                 model : str,
                 functions: List[Dict]) -> Iterable:
        response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                functions=functions,
                function_call="auto",
                stream=True
            )
        
        for chunk in response:
            yield chunk.choices[0].delta.content

    def __call__(self, *args: Any, **kwds: Any) -> Iterable:
        return self.generate(*args, **kwds)
        
