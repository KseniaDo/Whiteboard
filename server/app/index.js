const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const Board = require('./models/Board');

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board');
const User = require('./models/User');
const Element = require('./models/Element');

app.use(cors({
    origin: 'http://localhost:3001',
    methods: ["GET", "POST"],
    credentials: true,
}));
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ["GET", "POST"],
        credentials: true,
    },
    transports: ['websocket'],
});

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/board', boardRoutes);


mongoose.connect('mongodb://username:password@digboard-mongo:27017/boarddb?authSource=admin')
.then(() => {
    server.listen(3000, () => {
        console.log('server is running');
    });
})
.catch(console.error);

io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token found'));
    jwt.verify(token, "secret", (err, decoded) => {
        if (err) return next(new Error('Invalid token'));
        socket.user = decoded;
        next();
    });
});

io.on('connection', (socket) => {
    console.log('Detect new connection', socket.id);
    
    socket.on('getBoardDataServer', async (boardId) => {
        const boardData = await Board.findById(boardId).populate('elements');
        socket.emit('getBoardDataClient', boardData.elements);
    });

    socket.on('joinBoard', (boardId) => {
        socket.join(boardId);
        console.log(`User connected to the desk ${boardId}`);
        socket.emit('joined', boardId);
    });

    socket.on('addElementBoard', async({ boardId, elementData }) => {
        try {
            const newElement = await Element.create(elementData);
            await Board.findByIdAndUpdate(boardId, { $push: {elements: newElement._id}});
            socket.to(boardId).emit('getElementData', { element: newElement });
        } catch (err) {
            console.log('Add error', err);
            socket.emit('addDBError', { message: 'An error due to add, try again'});
        }
    });

    socket.on('changeElementBoard', async (data) => {
        const { boardId, elementId, updData } = data;
        try {
            const FreeElement = await Element.find({ elementId: elementId, owner: { $in:["null", updData.owner]}});
            if (FreeElement.length > 0 || updData.owner == "null") {
                await Element.findOneAndUpdate({ elementId: elementId }, updData);
                socket.to(boardId).emit('recieveChanges', { elementId, updData });
            } else {
                socket.emit('updError', { element: FreeElement });
            }
        } catch (err) {
            console.log('Save error', err);
            socket.emit('updDBError', { message: 'An error due to save, try again' });
        }
    });

    socket.on('deleteElementBoard', async({ boardId, elementId }) => {
        try {
            const deletedElement = await Element.findOneAndDelete({ elementId: elementId });
            const deletedElementId = deletedElement._id;
            await Board.findOneAndUpdate( { _id: boardId }, { $pull: { elements: deletedElementId }});
            socket.to(boardId).emit('deleteElement', elementId);
        } catch (err) {
            console.log('Delete error', err);
            socket.emit('delDBError', { message: 'An error due to delete, try again' });
        }
    });
});