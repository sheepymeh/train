const EXPRESS = require('express')();
const HTTP = require('http').createServer(EXPRESS);
const IO = require('socket.io')(HTTP);
const FS = require('fs');

const STATIONS = JSON.parse(FS.readFileSync('stations.json'));

EXPRESS.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});
EXPRESS.get('/stations.json', (req, res) => {
	res.sendFile(__dirname + '/stations.json');
});

IO.on('connection', socket => {
	console.log('Client Connected');
	socket.on('disconnect', () => {
		console.error('Client Disconnected');
	})
});
// Change to actual event
let timer = 160;
let timerReset = 1;
let station = 0;
setInterval(time => {
	timer -= 15;
	if (timer >= 0) {
		IO.emit('stationTime', timer);
	}
	else if (timerReset) {
		timerReset = 0;
		IO.emit('arriving');
		setTimeout(() => {
			IO.emit('doorsClosing');
			setTimeout(() => {
				IO.emit('nextStation', station);
				timer = STATIONS.stations[station].time;					
				timerReset = 1;
				station++;
			}, 800);
		}, 100);
	}
}, 300);

HTTP.listen(8080);
