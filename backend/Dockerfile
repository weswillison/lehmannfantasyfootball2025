FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create database directory
RUN mkdir -p /app/data

# Set database path for production
ENV DATABASE_PATH=/app/data/fantasy_football.db

EXPOSE 3001

CMD ["npm", "start"]