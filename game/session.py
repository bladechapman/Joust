from .room import RoomStatus
from .player import PlayerStatus

class Session():
    def __init__(self, room):
        if self._room.status == RoomStatus.playing:
            raise Exception("Session already in progress")

        self._room = room
        self._room.status = RoomStatus.playing
        for player in self._room._players:
            player.status = PlayerStatus.playing

    def eliminate_player_by_id(self, uuid):
        self._room._players[uuid].status = eliminated
        num_eliminated = sum(map(lambda x: x.status, self._room._players))
        if num_eliminated = len(self._room._players):
            self._room.status = RoomStatus.complete
