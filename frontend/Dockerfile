FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["sh","-c","npm start -- -H 0.0.0.0 -p ${PORT:-8080}"]