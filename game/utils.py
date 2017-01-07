from uuid import UUID
import collections
from game.game_object import GameObject

def build_game_update_payload(room):
    return {
        "room": room.serialize()
    }

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
