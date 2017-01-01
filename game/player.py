from uuid import uuid4
from enum import Enum
from .character import Character

class PlayerStatus(Enum):
    joined = 0
    waiting = 1
    playing = 2
    eliminated = 3

class Player():
    def __init__(self, room):
        self._room = room
        self._character = None
        self._status = PlayerStatus.joined
        self._id = uuid4()

    @property
    def room(self):
        return self._room

    @property
    def character(self):
        return self._character

    @character.setter
    def character(self, value):
        if not isinstance(value, Character):
             raise ValueError("Player character can only be set to member of \
# Character enum")
        if self._character is not None:
            raise Exception("Player's character is already set")
        self._character = Character
        self.status = PlayerStatus.waiting

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        if not isinstance(value, PlayerStatus):
            raise ValueError("Player status can only be set to member of \
# PlayerStatus enum")
        self._status = value

    @property
    def id(self):
        return self._id
