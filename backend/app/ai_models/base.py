# app/ai_models/base.py

from typing import Protocol, List, Dict, Iterable

class ClientProtocol(Protocol):

    def generate(self, messages : List[Dict], model : str) -> Iterable:...
