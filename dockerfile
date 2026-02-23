# Usamos una imagen ligera de Node
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación (genera la carpeta /dist)
RUN npm run build

# Exponemos el puerto que usa NestJS
EXPOSE 3000

# Comando para arrancar la app
CMD ["npm", "run", "start:prod"]