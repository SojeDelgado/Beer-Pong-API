# --- ETAPA DE BASE ---
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# --- ETAPA DE DESARROLLO ---
FROM base AS development
RUN npm install
COPY . .
# En desarrollo, Nest corre con watch mode
CMD ["npm", "run", "start:dev"]

# --- ETAPA DE CONSTRUCCIÓN (BUILD) ---
FROM base AS build
RUN npm install --only=development
COPY . .
RUN npm run build

# --- ETAPA DE PRODUCCIÓN ---
FROM node:20-alpine AS production
WORKDIR /usr/src/app
COPY package*.json ./
# Solo instalamos librerías necesarias para ejecutar (no las de desarrollo)
RUN npm install --only=production
# Copiamos solo lo compilado de la etapa anterior
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]