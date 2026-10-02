FROM node:22-bookworm

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies including devDependencies needed for TypeScript compilation
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV SCANNER_MODE=direct
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Remove devDependencies to keep image lean
RUN npm ci --omit=dev

# Install Chromium and system dependencies for headless browser automation
RUN npx playwright install --with-deps chromium \
    && chmod -R 777 /ms-playwright

EXPOSE 5000

CMD ["node", "dist/server.js"]