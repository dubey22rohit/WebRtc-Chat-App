const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const rateLimit = require("express-rate-limit");


const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100
});

app.use(cors(),limiter);

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Server running");
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callended");
  });

  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { signal: signalData, from, name });
  });

  socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", data.signal);
  });
});

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
