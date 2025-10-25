# Media WebRTC Service
FROM node:20-alpine

WORKDIR /app

# Simple placeholder service
RUN echo '{"name":"media","version":"1.0.0","dependencies":{"express":"^4.18.0"}}' > package.json && npm install

# Create minimal entry point
RUN echo 'const express = require("express");' > index.js && \
    echo 'const app = express();' >> index.js && \
    echo 'app.get("/health", (req, res) => res.json({ status: "ok" }));' >> index.js && \
    echo 'app.listen(3002, () => console.log("Media WebRTC service running on port 3002"));' >> index.js

EXPOSE 3002

CMD ["node", "index.js"]
