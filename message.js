import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  showBus,
  showCity,
  showStops,
  showCorrectbus,
  showStartEnd
} from './database.js';

// Setup Express and HTTP server
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 3000; // ✅ Use PORT for Render

// Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.get('/city', async (req, res) => {
  const data = await showCity();
  res.status(200).send(data);
});

app.get('/bus/:city', async (req, res) => {
  const city = req.params.city;
  const data = await showBus(city);
  res.status(200).send(data);
});

app.get('/buses', async (req, res) => {
  const { from, to } = req.query;
  const data = await showCorrectbus(from, to);
  res.status(200).send(data);
});

app.get('/busPath/:busName', async (req, res) => {
  const bus = req.params.busName;
  const data = await showStartEnd(bus);
  res.status(200).send(data);
});

app.get('/stops/:city', async (req, res) => {
  const city = req.params.city;
  const data = await showStops(city);
  res.status(200).send(data);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something Broke!');
});

// ✅ WebSocket logic
const buses = {};

io.on('connection', (socket) => {
  console.log("Socket Connection Successful");
  console.log(`Socket ID: ${socket.id}`);

  socket.emit("welcome", "Server connected ✅");

  socket.on('joinBus', (bus) => {
    if (!buses[bus]) {
      buses[bus] = [];
    }
    buses[bus].push(socket.id);
    socket.join(bus);
    console.log(`${socket.id} joined bus room: ${bus}`);
  });

  socket.on('clientConnect', (data) => {
    console.log(data);
  });

  socket.on('liveLocation', ({ bus, latitude, longitude }) => {
    console.log(` Send to Map Screen >>> Latitude: ${latitude}, Longitude: ${longitude}, Bus: ${bus}`);
    socket.broadcast.emit('receiveLive', { latitude, longitude });
    if (buses[bus]) {
      io.to(bus).emit('coords', {
        bus,
        latitude,
        longitude,
      });
    }
  });

  socket.on('removeBus', (bus) => {
    socket.leave(bus);
    if (buses[bus]) {
      buses[bus] = buses[bus].filter(id => id !== socket.id);
    }
    console.log(`${socket.id} left bus room: ${bus}`);
  });

  socket.on('client', (data) => {
    console.log(data);
  });

  socket.on('one', ({ data, latitude, longitude }) => {
    console.log('Message received from client:', data);
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    socket.emit('response', `Received your message: ${data}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const bus in buses) {
      buses[bus] = buses[bus].filter(id => id !== socket.id);
    }
  });
});

// ✅ Start server (Express + WebSocket)
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
