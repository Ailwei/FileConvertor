FROM node:18

RUN apt-get update && apt-get install -y \
    imagemagick \
    graphicsmagick \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
