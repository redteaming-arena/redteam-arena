from __future__ import annotations

import random
from typing import List
from api.models import base
from api.models.base import ModelClients


class ModelManager:
    
    def __init__(self, clients : List[ModelClients]) -> None:
        super().__init__()
        self.clients = clients
        
    def sample(self):...
    
    def forward(self):...
        