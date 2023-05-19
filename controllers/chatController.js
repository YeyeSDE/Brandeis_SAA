const Message = require("../models/message");
// establish socket communication between clients and server
module.exports = (io) => {
  io.on("connection", (client) => {
    client.broadcast.emit("user joined"); // name of the event: user joined.
    client.on("disconnect", () => {
      client.broadcast.emit("user disconnected");
      console.log("user disconnected");
    });
    client.on("message", (data) => {
      let messageAttributes = {
        content: data.content,
        userName: data.userName,
        user: data.userId,
      };
      Message.create(messageAttributes)
        .then(() => {
          io.emit("message", messageAttributes);
        })
        .catch((error) => {
          console.log(`error: ${error.message}`);
        });
    });
    Message.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .then((messages) => {
        client.emit("load all messages", messages.reverse());
      });
  });
};