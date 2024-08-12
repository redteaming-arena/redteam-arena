# app/ai_models/base.py

from abc import ABC, abstractmethod

class AIModel(ABC):
    @abstractmethod
    def generate_response(self, conversation_history, user_input):
        pass
