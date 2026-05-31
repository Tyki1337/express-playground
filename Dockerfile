FROM node:20-alpine
WORKDIR /express_playground
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci  
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD [ "npx", "tsx", "--watch", "server.ts" ]