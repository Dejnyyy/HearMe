FROM node

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . /app

RUN npx prisma generate

CMD ["npm", "run", "dev"]