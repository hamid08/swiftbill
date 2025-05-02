# Stage 1: Build the application
FROM reg.pga.lan/tools/node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files to the container
COPY . .

# Build the application
RUN npm run build

# ===========================
# 🌐 Application Configuration
# ===========================
ENV PORT=2324
ENV NODE_ENV=development

# ===========================
# 🛠️ Infrastructure Services
# ===========================
ENV MONGO_URL=mongodb://192.168.3.34:27888/swift-bill
ENV RABBITMQ_URL="Host=192.168.3.34:5672;Username=hamid;Password=hamid;VirtualHost=/"


# ===========================
# 🌍 CORS Configuration
# ===========================
ENV ALLOWED_ORIGINS_API=http://localhost:8383,http://localhost:9004

# Expose the port the app runs on
EXPOSE 2324

# Start the application
CMD ["npm", "start"]