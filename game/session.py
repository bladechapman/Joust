from game.room import RoomStatus
from game.player import PlayerStatus
from game.game_object import GameObject
from game.utils import delay_random, build_game_update_payload
from enum import Enum
from random import random
import gc

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

        # start slow, change to fast, and on and on
        self._status = SessionStatusEnum.slow
        self.playbackStartTimestamp = 0
        delay_random(lower=30, upper=60)(self.change_speed)()

    def change_speed(self):
        """
        Adjusts the speed of the session after some random amount of time
        """
        if (self._room is None):
            return

        if self.status == SessionStatusEnum.slow:
            self._status = SessionStatusEnum.fast
            cs = delay_random(lower=13, upper=20)(self.change_speed)
        else:
            self._status = SessionStatusEnum.slow
            cs = delay_random(lower=30, upper=60)(self.change_speed)

        self.playbackStartTimestamp = int(random() * 60)
        # TODO: Kill with fire, note that std threading libraries must be monkey patched with relevant networking library (eventlet)
        # https://github.com/miguelgrinberg/Flask-SocketIO/issues/192
        self._room.socket.emit("game_update", build_game_update_payload(self._room), room=str(self._room.id))
        cs()

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
        if num_eliminated == len(self._room.players) - 1:
            for player_id in self._room.players:
                if self._room.players[player_id].status == PlayerStatus.playing:
                    self._room.last_winner_id = player_id
                self._room.players[player_id].status = PlayerStatus.joined
            self._room.status = RoomStatus.complete
            self._room.session = None
            self._room = None

    def serialize(self):
        """
        Serializes the current session
        :return: A JSON serializable json object
        """
        return {
            "status_readable": self.status.name,
            "status_code": self.status.value,
            "playback_start_timestamp": self.playbackStartTimestamp
        }

    @property
    def status(self):
        """
        Session status is read only
        """
        return self._status
