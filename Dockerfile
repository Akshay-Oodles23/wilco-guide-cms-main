FROM node:20-alpine
WORKDIR /app

# Install ALL dependencies (including devDependencies for Tailwind + PostCSS)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build settings
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Run build
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
