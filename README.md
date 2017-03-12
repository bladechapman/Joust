<p align="center">
  <img src="http://i.imgur.com/ISbTJOM.png"/>
</p>
<h1 align="center">Joust</h1>
<p align="center">A Mobile Web Interpretation of <a href=http://jsjoust.com/>Johann Sebastian Joust</a></p>

## What is Joust?
Joust is a mobile web game designed to designed to get you and your friends moving! The goal is
to be the last player standing. When the music is slow, your controller (phone) is very
sensitive to movement. Try to jostle your opponents' controllers to eliminate them, but be careful!
If you move too quickly yourself, you're out of the game!. When the music speeds up, you're allowed
a small window to dash towards your opponents to eliminate them.

## How Do I Play?
1. Navigate to the address where your game server is being hosted from your mobile device.
2. Un-mute your phone and crank up the volume!
3. Press "Create Room", or type a room code and press "Join Room"
4. To ready up, press and hold the large square containing your character. Keep holding while the game has started or else you'll be eliminated!
5. Once everybody is ready, play Joust!

## Setup
To set up your own Joust server, clone this repository and run:
```
$ pip3 install -r requirements.txt
```
To start your Joust server, run
```
$ python3 server.py
```

## Troubleshooting
### The Server
Joust's server utilizes Flask and Flask-SocketIO for python3. Make sure all the proper
dependencies are installed and that you have python3 installed.

### The Client
Joust is only playable on motion-enabled devices.
The client utilizes the [DeviceMotionEvent API](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent). Because
this API is still experimental, it has some quirks that may cause issues with your
particular device. See the [documentation](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent)
for more compatibility details.

## To do
- Make server more scalable by adopting WSGI-nginx architecture
- Clean up the client code so functions are less exposed
- Integrate front-end build process, and accommodate robust ES6, LESS, and minification.
