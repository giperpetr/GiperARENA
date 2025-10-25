# Realtime WebSocket Service (Socket.io)
FROM node:20-alpine

WORKDIR /app

# Simple placeholder service
RUN echo '{"name":"realtime","version":"1.0.0","dependencies":{"socket.io":"^4.6.0"}}' > package.json && npm install

# Create minimal entry point
RUN echo 'const { Server } = require("socket.io");' > index.js && \
    echo 'const io = new Server(3001, { cors: { origin: "*" } });' >> index.js && \
    echo 'console.log("Realtime WebSocket service running on port 3001");' >> index.js && \
    echo 'io.on("connection", (socket) => { console.log("Client connected"); });' >> index.js

EXPOSE 3001

CMD ["node", "index.js"]
