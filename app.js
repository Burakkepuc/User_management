const express = require("express");
const http = require("http"); // http modülünü ekleyin
const CustomError = require("./src/utils/error");
const Response = require("./src/utils/response");
const { PrismaClient } = require('@prisma/client');
const { initializeWebSocketServer } = require("./src/utils/webSocket");

const prismaClient = new PrismaClient();
require("dotenv").config();

const app = express();
const server = http.createServer(app); // http sunucusunu oluşturun

const port = process.env.PORT || 3000;

app.get("/ping", async (req, res) => {
  const allUsers = await prismaClient.user.findMany();
  res.json({
    message: allUsers
  });
});

app.use((req, res, next) => {
  console.log(req.url, req.method, req.hostname);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', require('./src/routes/index'));

initializeWebSocketServer(server);

// Global Error
app.use((req, res, next) => {
  const err = new CustomError(500, 'Not Found !', 'Please check your url or steps');
  const resp = Response.errorResponse(err);
  res.status(resp.code).json(resp);
});

server.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor...`);
});
