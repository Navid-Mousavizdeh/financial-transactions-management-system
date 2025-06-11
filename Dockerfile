# Step 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Step 2: Run
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/json-server ./json-server

# Install concurrently to run multiple processes
RUN npm install --global concurrently
EXPOSE 3000 3001
CMD ["concurrently", "--kill-others", "\"npx json-server --port 3001 db.json\"", "\"npx next start\""]