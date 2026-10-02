
FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --include=optional

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]