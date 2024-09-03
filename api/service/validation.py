from __future__ import annotations
from typing import List

# simple validation 

# assumption: since it's an objective we exploit 
def score_token_length(tokens_used : List[str], 
                       /, 
                       a : float = 1.0,
                       b : float = 0.99):
    """ Token length exponential decay """
    return a * ((1 - b)**len(tokens_used))

def score_time_length(time : float, 
                       /, 
                       a : float = 1.0,
                       b : float = 0.99):
    """ Time length exponential decay (sec) """
    return a * ((1 - b)**(time/60))

def prompt_frequency(num_of_times_used : float,
                     tokens_distance : float,
                     /,
                     a : float = 1.0,
                     b : float = 0.99):
    """ Times used, and token distance should lower the score """
    if tokens_distance == 0:
        return a * ((1 - b)**num_of_times_used)
    else:
        return a * ((1 - b)**tokens_distance)
    
    