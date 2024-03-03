const exp = require("express")
const app = exp()
const port = 5000
const bodyParser = require('body-parser')
const mainRouter = require("./Router/mainRouter")
const mongoose = require("mongoose")
require("dotenv").config()
const dburl = process.env.dbLink
const cors = require("cors");
mongoose.connect(dburl)

const db = mongoose.connection


const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}




db.once("open", () => {
    console.log("mongoo db Connect")
})

db.on("error", (e) => {
    console.log(e, "mongoo db disconnect")
})







// parse application/json
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(mainRouter)


app.listen(process.env.PORT || 5000, () => {
    console.log("port asssign", port)
})



const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const Message = require("./Model/messageSchema");

// const io = new Server(server); // Create the Socket.IO server instance

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Implement your custom logic here to determine if the origin is allowed
            // You can check the origin, methods, headers, and other criteria
            if (origin === 'http://localhost:3000' || origin === 'http://localhost:3001' || origin === 'https://ec-customer.vercel.app' || origin === 'https://ec-frontend-caterer.vercel.app' || origin === "https://ec-frontend-superadmin.vercel.app") {
                callback(null, true);
            } else {
                callback(new Error('Origin not allowed'));
            }
        },		// origin: 'http://localhost:3001',  // Adjust this based on your frontend URL
        methods: ['GET', 'POST'],
    },
});
// Handle connections and events within the Socket.IO server
// app.post('/socket', (req, res) => {

io.on('connection', (socket) => {
    console.log("socketId", socket.id);
    // console.log("user", req.user);
    console.log('User connected:', socket.id);

    socket.on('customer', (id) => {
        console.log('customer connected: ' + id);
        socket.join(id);
    });

    socket.on('message', async (data) => {
        console.log('message received:', data);

        const chat = new Message({
            userId: data.id,
            message: data.message,
            roomId: data.id,
            fromAdmin: false,
            type: data.type
        });
        await chat.save();

        io.to(data.id).emit('message', { message: data.message, fromAdmin: false });
    });

    socket.on('adminReply', async (data) => {
        console.log('admin reply received:', data);

        const chat = new Message({
            customer: data.id,
            message: data.message,
            fromAdmin: true,
            roomId: data.id,
            type: data.type,
            userId: data.id
        });
        await chat.save();

        io.to(data.id).emit('message', { message: data.message, fromAdmin: true });
    });

});

const chatPort = 4000
server.listen(chatPort, () => {
    console.log('Chat App Server listening on port ', chatPort);
});

