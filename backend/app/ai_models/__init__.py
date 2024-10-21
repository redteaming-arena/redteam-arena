from __future__ import annotations
import os

import random
from typing import Optional

from .anthropic_model import AnthropicClient
from .openai_model import OpenAIClient
from .gemini_model import GeminiClient
from .base import ClientProtocol

from dotenv import load_dotenv

load_dotenv()

__all__ = ["sampler", "ClientProtocol"]

OPENAI_MODELS = [
    {"endpoint": "gpt-4o", "name": "gpt-4o"},
    {"endpoint": "gpt-4o-mini", "name": "gpt-4o-mini"},
    {"endpoint": "gpt-3.5-turbo", "name": "gpt-3.5-turbo"},
]
ANTHROPIC_MODELS = [
    {"endpoint": "claude-2.1", "name": "claude-2.1"},
    {"endpoint": "claude-3-5-sonnet-20240620", "name": "claude-3-5-sonnet-20240620"},
    {"endpoint": "claude-3-haiku-20240307", "name": "claude-3-haiku-20240307"},
]
GOOGLE_MODELS = [
    {"endpoint": "gemini-1.5-pro", "name": "gemini-1.5-pro"},
    {"endpoint": "gemini-1.5-flash", "name": "gemini-1.5-flash"},
]
FIREWORKS_MODELS = [
    {"endpoint": "accounts/fireworks/models/llama-v3p1-70b-instruct", "name": "llama-3.1-70b-instruct"},
    {"endpoint": "accounts/fireworks/models/llama-v3p1-8b-instruct", "name": "llama-3.1-8b-instruct"},
]

class AIModelSampler:
    def __init__(self):
        self.providers = ["openai", "anthropic", "google", "fireworks"]
        # self.providers = ["openai"]
        self.model_map = {
            "openai" : OPENAI_MODELS,
            "anthropic" : ANTHROPIC_MODELS,
            "google" : GOOGLE_MODELS,
            "fireworks" : FIREWORKS_MODELS,
        }
        self.clients_map = {
            "openai": OpenAIClient(api_key=os.getenv("OPENAI_API_KEY")),
            "anthropic": AnthropicClient(api_key=os.getenv("ANTHROPIC_API_KEY")),
            "google": GeminiClient(api_key=os.getenv("GEMINI_API_KEY")),
            "fireworks": OpenAIClient(
                api_key=os.getenv("FIREWORKS_API_KEY"),
                base_url="https://api.fireworks.ai/inference/v1"
            ),
        }

    def get_available_models(self):
        models = [] 
        for providers in self.providers:
            for model in self.model_map.get(providers, []):
                models.append(model)
        return models

    def sample_provider(self) -> str:
        return random.choice(self.providers)

    def sample_model(self, provider: Optional[str] = None) -> Optional[str]:
        if provider is None:
            provider = self.sample_provider()

        if not self.model_map[provider]:
            self.get_available_models()
        
        if self.model_map[provider]:
            return random.choice(self.model_map[provider])
        return None

    def get_client(self, provider: str) -> Optional[object]:
        return self.clients_map.get(provider)


    def get_provider_for_model(self, model: str) -> Optional[str]:
        for provider, models in self.model_map.items():
            for m in models:
                if m["name"] == model["name"]:
                    return provider
        return None
    
sampler = AIModelSampler()

