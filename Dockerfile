# Usamos Node 20 como base (la versión estable y ligera)
FROM node:20-slim

# Instalamos Java (OpenJDK 17, suficiente para Maxwell)
RUN apt-get update && \
    apt-get install -y openjdk-17-jre && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Creamos carpeta de trabajo
WORKDIR /app

# Copiamos todo tu código (incluyendo la carpeta maxwell/)
COPY . .

# Instalamos las dependencias de Node (socket.io-client)
RUN npm install

# Comando para iniciar tu app
CMD ["npm", "start"]