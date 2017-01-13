from game.room import RoomStatus
from game.player import PlayerStatus
from game.game_object import GameObject
from game.utils import delay_random
from enum import Enum

class SessionStatusEnum(Enum):
    slow = 0
    fast = 1

class Session(GameObject):
    def __init__(self, room):
        """
        Initializes a new session object with the given room
        :param room: Room object the session belongs to
        """
        super().__init__()
        self._room = room
        if self._room.status == RoomStatus.playing:
            raise Exception("Session already in progress")
        self._room.status = RoomStatus.playing
        for player_id in self._room.players:
            self._room.players[player_id].status = PlayerStatus.playing
        self._room.session = self
        self._status = SessionStatusEnum.slow
        self._change_speed()

    @delay_random(lower=5, upper=15)
    def _change_speed(self):
        if (self._room.session is None):
            return
        if self.status == SessionStatusEnum.slow:
            self._status = SessionStatusEnum.fast
        else:
            self._status = SessionStatusEnum.slow
        self._change_speed()

    def eliminate_player_by_id(self, uuid):
        """
        Eliminates the player from the session
        :param uuid: uuid of the player to eliminate
        """
        self._room._players[uuid].status = PlayerStatus.eliminated
        self.validate()

    def validate(self):
        """
        Validates the status of the session and the corresponding room.
        If all players have been eliminated, this will update the status of
        the room and each player involved
        """
        num_eliminated = sum(map(lambda x: x.status == PlayerStatus.eliminated, self._room.players.values()))
        if num_eliminated == len(self._room.players):
            self._room.status = RoomStatus.complete
            for player_id in self._room.players:
                self._room.players[player_id].status = PlayerStatus.joined
            self._room.session = None

    def serialize(self):
        """
        Serializes the current session
        :return: A JSON serializable json object
        """
        return {
            "status_readable": self.status.name,
            "status_code": self.status.value
        }

    @property
    def status(self):
        """
        Session status is read only
        """
        return self._status
