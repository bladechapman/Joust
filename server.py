from flask import Flask, redirect, send_from_directory
from flask_socketio import SocketIO
from game.room import Room
from game.player import Player
from uuid import UUID
import json

app = Flask(__name__, static_folder="public", static_path="")
socketio = SocketIO(app)

active_rooms = {}

@app.route("/new_room", methods=["GET"])
def create_new_room():
    new_room = Room()
    new_player = new_room.add_new_player()
    active_rooms[new_room.id] = new_room
    return redirect("/game/{}/{}".format(str(new_room.id), str(new_player.id)),
        code=302)

@app.route("/join_room/<string:room_id>", methods=["GET"])
def join_existing_room(room_id):
    if UUID(room_id) not in active_rooms:
        raise Exception("Room does not exist")
    existing_room = active_rooms[UUID(room_id)]
    new_player = existing_room.add_new_player()
    return redirect("/game/{}/{}".format(str(existing_room.id), str(new_player.id)),
        code=302)

@app.route("/game/<string:room_id>/<string:player_id>")
def serve_room(room_id, player_id):
    return send_from_directory("public", "session.html")

@app.route("/begin_session/<string:room_id>")
def begin_session_for_room(room_id):
    raise Exception("TODO")

if __name__ == "__main__":
    socketio.run(app)
    # app.run()
