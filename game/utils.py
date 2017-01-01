
def build_game_update_payload(room):
    return {
        "room_status": room.status.value,
        "room_status_readable": room.status.name,
        "players_status": {str(player_id):room.players[player_id].status.value for player_id in room.players},
        "player_status_readable": {str(player_id):room.players[player_id].status.name for player_id in room.players}
    }
