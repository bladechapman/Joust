from enum import Enum
from .character import Character
from game.game_object import GameObject
from uuid import uuid4
import json

class PlayerStatus(Enum):
    joined = 0
    ready = 1
    playing = 2
    eliminated = 3

class Player(GameObject):
    def __init__(self, room, id=uuid4()):
        """
        Initializes a new Player object
        :param room: Room object the Player belongs to
        :param id: Optional id parameter
        """
        super().__init__(id=id)
        self._room = room
        self._character = None
        self._status = PlayerStatus.joined

    def serialize(self):
        return {
            "id": str(self.id),
            "status_code": self.status.value,
            "status_readable": self.status.name,
            "character": None if self.character is None else self.character.value
        }

    @property
    def room(self):
        """
        Room property is read only
        """
        return self._room

    @property
    def character(self):
        """
        character property getter
        :return: value of Character enum representing player's chosen character
        """
        return self._character

    @character.setter
    def character(self, value):
        """
        Player character can only be set to a value in the Character enum
        :param value: Character enum value
        """
        if not isinstance(value, Character):
             raise ValueError("Player character can only be set to member of \
                                # Character enum")
        if self._character is not None:
            raise Exception("Player's character is already set")
        self._character = value

    @property
    def status(self):
        """
        status property getter
        :return: value in PlayerStatus enum representing player's status
        """
        return self._status

    @status.setter
    def status(self, value):
        """
        Sets the Player's status.
        :param value: Member of PlayerStatus enum
        """
        if not isinstance(value, PlayerStatus):
            raise ValueError("Player status can only be set to member of \
                                # PlayerStatus enum")
        self._status = value
