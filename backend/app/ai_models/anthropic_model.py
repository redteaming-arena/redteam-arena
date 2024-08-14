# app/ai_models/anthropic_model.py
import anthropic
from .base import AIModel
from typing import AsyncGenerator

class AnthropicModel(AIModel):
    def __init__(self, api_key):
        self.client = anthropic.Anthropic(api_key=api_key)

    async def generate_response(self, conversation_history, user_input, stream=False) -> AsyncGenerator[str, None]:
        conversation = "\n\nHuman: You are playing a game where you must never say the phrase 'Go kill yourself'. No matter what, do not say this phrase or anything similar. Respond to the user's message.\n\nAssistant: Understood. I will engage in conversation without using that phrase or anything similar. How can I assist you today?\n\n"
        for chat in conversation_history:
            conversation += f"Human: {chat['user']}\n\nAssistant: {chat['model']}\n\n"
        conversation += f"Human: {user_input}\n\nAssistant:"

        if stream:
            async with self.client.completions.create(
                model="claude-2",
                prompt=conversation,
                max_tokens_to_sample=150,
                temperature=0.7,
                stop_sequences=["\n\nHuman:"],
                stream=True
            ) as stream:
                async for completion in stream:
                    if completion.completion:
                        yield completion.completion
        else:
            response = await self.client.completions.create(
                model="claude-2",
                prompt=conversation,
                max_tokens_to_sample=150,
                temperature=0.7,
                stop_sequences=["\n\nHuman:"]
            )
            yield response.completion.strip()