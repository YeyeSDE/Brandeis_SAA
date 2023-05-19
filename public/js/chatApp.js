const socket = io();
$("#chatForm").submit(() => {
  let text = $("#chat-input").val(),
    userName = $("#chat-user-name").val(),
    userId = $("#chat-user-id").val();
  socket.emit("message", { content: text, userId: userId, userName: userName });
  $("#chat-input").val("");
  return false;
});

socket.on("message", (message) => {
  displayMessage(message);
  for (let i = 0; i < 5; i++) {
    $(".chat-icon").fadeOut(200).fadeIn(200);
  }
});

socket.on("load all messages", (data) => {
  data.forEach((message) => {
    displayMessage(message);
  });
});

socket.on("user disconnected", () => {
  displayMessage({
    userName: "Notice",
    content: "User left the chat",
  });
});

socket.on("user joined", () => {
  displayMessage({
    userName: "Notice",
    content: "User joined the chat",
  });
});

let displayMessage = (message) => {
  $("#chat").prepend(
    $("<li>").html(
      `<strong class="message ${getCurrentUserClass(message.user)}">${
        message.userName
      }</strong>: ${message.content}`
    )
  );
};

let getCurrentUserClass = (id) => {
  let userId = $("#chat-user-id").val();
  return userId === id ? "current-user" : "other-user";
};
