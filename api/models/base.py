from typing import Protocol, List, Dict, Iterable

class ModelClients(Protocol):
    def generate(self, message : List[Dict], content: str) -> Iterable:...
    