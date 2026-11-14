# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10007

COPY package*.json ./
RUN npm install --omit=dev

RUN mkdir -p /app/data
COPY --from=builder /app/dist ./dist
COPY server.js ./

VOLUME /app/data
EXPOSE 10007

CMD ["node", "server.js"]
