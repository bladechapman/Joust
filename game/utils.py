import collections
import threading
from game.game_object import GameObject
import time
from random import random
from uuid import UUID
from functools import wraps

def build_game_update_payload(room):
    return {
        "room": room.serialize(),
        "timestamp": get_timestamp_milliseconds()
    }

def generate_four_letter_code():
    """
    Generate a random four letter code for use in room id
    """
    return "".join([chr(int(random() * 26 + 65)) for i in range(4)])

def build_timestamp_payload():
    """
    For use in ntp syncing
    """
    return {
        "timestamp": get_timestamp_milliseconds()
    }

def get_timestamp_milliseconds():
    """
    :return: The number of milliseconds since Unix epoch
    """
    return int(time.time() * 1000)

def delay_random(lower=1.0, upper=3.0):
    """
    Decorator delaying the execution of a function
    http://fredericiana.com/2014/11/14/settimeout-python-delay/
    :param delay: the number of seconds to delay the function execution
    """
    def wrap(f):
        @wraps(f)
        def delayed(*args, **kwargs):
            delay = int(random() * (upper - lower) + lower)
            timer = threading.Timer(delay, f, args=args, kwargs=kwargs)
            timer.start()
        return delayed
    return wrap

class UUIDCollection(collections.MutableMapping):
    """
    Manages a collection of items indexed by UUID
    """
    def __init__(self, *args, **kwargs):
        self.store = dict()
        self.update(dict(*args, **kwargs))

    def serialize(self):
        return {id.hex:
            self.store[id].serialize() if isinstance(self.store[id], GameObject)
            else self.store[id]
            for id in self.store}

    def __getitem__(self, key):
        return self.store[self.__keytransform__(key)]

    def __setitem__(self, key, value):
        self.store[self.__keytransform__(key)] = value

    def __delitem__(self, key):
        del self.store[self.__keytransform__(key)]

    def __iter__(self):
        return iter(self.store)

    def __len__(self):
        return len(self.store)

    def __keytransform__(self, key):
        if type(key) == UUID:
            return key
        else:
            return UUID(key)
