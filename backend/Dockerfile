FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Use npm install because no lockfile is present in this context; omit dev deps for a smaller image.
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
