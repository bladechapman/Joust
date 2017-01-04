from .player import Player
from .character import Character
from enum import Enum
from uuid import uuid4

class RoomStatus(Enum):
    waiting = 0
    playing = 1
    complete = 2

class Room():
    def __init__(self):
        self._id = uuid4()
        self._status = RoomStatus.waiting
        self._players = {}
        self._character_iter = iter(Character)
        self.session = None

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        if not isinstance(value, RoomStatus):
            raise TypeError("Room status can only be set to member of \
# RoomStatus enum")
        self._status = value

    def add_new_player(self, uuid):
        if len(self._players) == 4:
            raise IndexError("Room can only have a maximum of 4 players")
        player = Player(self, uuid)
        self._players[player.id] = player
        return player

    def remove_player_by_id(self, uuid):
        if uuid not in self._players:
            return False
        del self._players[uuid]
        if self.session is not None:
            self.session.tick()
        return True

    def select_character_for_player_id(self, uuid):
        if uuid not in self._players:
            raise KeyError("Player not in room")
        player.character = next(self._character_iter)

    @property
    def players(self):
        return self._players

    @property
    def id(self):
        return self._id
