    # ---------- Build Stage ----------
    FROM node:22 AS builder

    WORKDIR /app

    # Install OpenSSL in build stage
    RUN apt-get update -y && apt-get install -y openssl

    # Copy package files and install dependencies
    COPY package*.json ./
    RUN npm ci --legacy-peer-deps

    # Install global dev tools
    RUN npm install -g ts-node tsconfig-paths pm2

    # Copy the rest of the project files
    COPY . .

    # Generate Prisma client
    RUN npx prisma generate --schema=./src/database/postgres/prisma/schema.prisma

    # Build the application
    RUN npm run build


    # ---------- Runtime Stage ----------
    FROM node:22-slim AS runtime

    # Install OpenSSL and PM2 in runtime stage
    RUN apt-get update -y && \
        apt-get install -y openssl && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

    RUN npm install -g pm2

    WORKDIR /app

    # Copy only necessary files from builder
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

    # Ensure entrypoint is executable
    RUN chmod +x /app/entrypoint.sh

    ENTRYPOINT ["/app/entrypoint.sh"]
