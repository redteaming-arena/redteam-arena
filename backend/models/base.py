from __future__ import annotations

import random
from typing import List
from api.models import base
from typing import Protocol, List, Dict, Iterable

class ModelClients(Protocol):
    def generate(self, message : List[Dict], content: str) -> Iterable:...
    

class ModelManager:
    
    def __init__(self, clients : List[ModelClients]) -> None:
        super().__init__()
        self.clients = clients
        
    def sample(self):...
    
    def forward(self):...
        