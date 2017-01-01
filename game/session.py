from .room import RoomStatus
from .player import PlayerStatus

class Session():
    def __init__(self, room):
        self._room = room
        if self._room.status == RoomStatus.playing:
            raise Exception("Session already in progress")
        self._room.status = RoomStatus.playing
        for player_id in self._room.players:
            self._room.players[player_id].status = PlayerStatus.playing
        self._room.session = self

    def eliminate_player_by_id(self, uuid):
        self._room._players[uuid].status = PlayerStatus.eliminated
        num_eliminated = sum(map(lambda x: x.status == PlayerStatus.eliminated, self._room.players.values()))
        if num_eliminated == len(self._room.players):
            self._room.status = RoomStatus.complete
            for player_id in self._room.players:
                self._room.players[player_id].status = PlayerStatus.waiting
