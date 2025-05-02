# Stage 1: Build the application
FROM reg.pga.lan/tools/node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy .npmrc from the project directory
COPY .npmrc .npmrc

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
ENV REDIS_URL=redis://@192.168.3.34:6379
ENV MONGO_URL=mongodb://192.168.3.34:27888/tracking-customer-hamid
ENV RABBITMQ_URL="Host=192.168.3.34:5672;Username=hamid;Password=hamid;VirtualHost=/"
ENV POSTGRESQL_URL="Host=192.168.3.23:5332;Database=pga-orm116;Username=root;Password=fr24Password"

# ===========================
# 🔐 Authentication & Security
# ===========================
ENV AUTH_SECRET_KEY=DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=
ENV AUTH_AUDIENCE=tracking-micro
ENV AUTH_AUTHORITY=https://192.168.3.62:7057/
ENV API_KEY=ac48d83993c77c7c38c2a35ac0848ca9

# ===========================
# ⛅ Open Weather API Configuration
# ===========================
ENV OPEN_WEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather
ENV OPEN_WEATHER_API_TOKEN=8cd899303d0bf3383700e8a0e67e0e83

# ===========================
# 🔄 API Synchronization Settings
# ===========================
ENV SYNC_MODE=1
ENV SYNC_SINGLE_URL=http://localhost:56324
ENV SYNC_SINGLE_ACCESS_KEY=f926363b-2357-47a0-a03e-560927cfac4a
ENV SYNC_FLEET_URL=https://localhost:58851
ENV SYNC_CORE_URL=https://localhost:56773
ENV SYNC_API_CLIENT_ID=separta_api
ENV SYNC_API_CLIENT_SECRET=fac58c1e-04be-4b62-8171-f4e69257564c
ENV SYNC_API_CLIENT_SCOPE=resource_separta_api

# ===========================
# 📍 Tracking Agent Configuration
# ===========================
ENV TRACKING_AGENT_URL=http://localhost:8686
ENV TRACKING_AGENT_COMMUNICATION_GUARD_TOKEN=A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6

# ===========================
# 🗺️ Neshan API Configuration
# ===========================
ENV NESHAN_API_URL=https://api.neshan.org/v5/reverse
ENV NESHAN_API_KEY=service.59b59746045741118e784a21097bddbd

# ===========================
# 🤝 Tracking Partner Services
# ===========================
ENV TRACKING_PARTNER_ENABLED=true
ENV TRACKING_PARTNERS_AUTH_TOKEN='sk_part_3aX2!9z$B8qY5%vF7pL6*wDcRnKtJmH'
ENV TRACKING_PARTNER_IDS=1801,1802

# ===========================
# ⚙️ External Gateway Configuration
# ===========================
ENV EG_ENABLED=false

# ===========================
# 🌍 CORS Configuration
# ===========================
ENV ALLOWED_ORIGINS_API=http://localhost:8383,http://localhost:9004

# Expose the port the app runs on
EXPOSE 2324

# Start the application
CMD ["npm", "start"]