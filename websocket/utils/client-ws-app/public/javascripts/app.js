let socketCount = 0;
let messageCount = 0;
let lastMessage;

function ts() {
  return new Date().getTime();
}

const cookieName = document.getElementById('cookie').innerHTML;
const tokenData = document.getElementById('tokens').innerHTML;
const tokens = JSON.parse(tokenData);

function connect() {
  if (socketCount >= tokens.length) return;

  // using https://github.com/js-cookie/js-cookie
  // eslint-disable-next-line no-undef
  Cookies.set(cookieName, tokens[socketCount], { path: '' });

  // Create WebSocket connection.
  let url = `ws://127.0.0.1:8080?last_id=${ts()}`;
  const socket = new WebSocket(url);

  // Connection opened
  socket.addEventListener('open', function () {
    socketCount++;
    document.getElementById('socket-count').innerHTML = socketCount;
    connect();

    socket.send('Hello Server!');
  });

  // Listen for messages
  socket.addEventListener('message', function (event) {
    messageCount++;
    lastMessage = event.data;
  });
}

connect();

setInterval(() => {
  document.getElementById('message-count').innerHTML = messageCount;
  document.getElementById('message-debug').innerHTML = lastMessage;
}, 250);
