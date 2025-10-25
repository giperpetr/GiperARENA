# Blockchain Service (Solana)
FROM node:20-alpine

WORKDIR /app

# Simple placeholder service  
RUN echo '{"name":"blockchain","version":"1.0.0","dependencies":{"express":"^4.18.0"}}' > package.json && npm install

# Create minimal entry point
RUN echo 'const express = require("express");' > index.js && \
    echo 'const app = express();' >> index.js && \
    echo 'app.get("/health", (req, res) => res.json({ status: "ok", service: "blockchain" }));' >> index.js && \
    echo 'app.listen(3003, () => console.log("Blockchain service running on port 3003"));' >> index.js

EXPOSE 3003

CMD ["node", "index.js"]
