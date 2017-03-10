import collections
from game.game_object import GameObject
from game.player import Player
from game.character import Character
from enum import Enum
from uuid import uuid4
from game.utils import UUIDCollection, generate_four_letter_code

class RoomStatus(Enum):
    waiting = 0
    playing = 1
    complete = 2

class Room(GameObject):
    def __init__(self, id=None):
        """
        Initializes a new room object
        """
        if id is None:
            id = generate_four_letter_code()
        super().__init__(id=id)
        self._status = RoomStatus.waiting
        self._players = UUIDCollection()
        self._free_characters = set(list(Character))
        self.session = None
        self.last_winner_id = None

    def add_new_player(self, uuid=uuid4()):
        """
        Creates a new player with the given id and adds it to the room
        :param uuid: Optional uuid that will be assigned to the player
        :return: The player that has joined the room
        """
        if len(self._players) == 4:
            raise IndexError("Room can only have a maximum of 4 players")
        if self.session is not None:
            raise Exception("Cannot join room while session is in progress")
        player = Player(self, id=uuid)
        self._players[player.id] = player
        self.select_character_for_player_id(player.id)
        return player

    def remove_player_by_id(self, uuid):
        """
        Removes a player from the room by uuid and updates the session if one
        is active
        :param uuid: the uuid of the player to be removed
        :return: Boolean whether or not the player was successfully removed
        """
        if uuid not in self._players:
            return False
        self._free_characters.add(self._players[uuid].character)
        del self._players[uuid]
        if self.session is not None:
            self.session.validate()
        return True

    def select_character_for_player_id(self, uuid):
        """
        Selects a character for a player by uuid. Use this to make sure
        characters are consistent between rooms
        :param uuid: uuid of player to be assigned character
        """
        if uuid not in self._players:
            raise KeyError("Player not in room")
        self.players[uuid].character = self._free_characters.pop()

    def serialize(self):
        return {
            "id": self.id,
            "players": self.players.serialize(),
            "status_code": self.status.value,
            "status_readable": self.status.name,
            "session": None if self.session is None else self.session.serialize(),
            "last_winner_id": None if self.last_winner_id is None else self.last_winner_id.hex
        }

    @property
    def status(self):
        """
        status property getter
        :return: current room status
        """
        return self._status

    @status.setter
    def status(self, value):
        """
        status property setter.
        :param value: Value to set status to. Must be a member of the
        RoomStatus enum
        """
        if not isinstance(value, RoomStatus):
            raise TypeError("Room status can only be set to member of \
                            # RoomStatus enum")
        self._status = value

    @property
    def players(self):
        """
        players property is read only
        """
        return self._players
