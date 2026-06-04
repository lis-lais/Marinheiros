FROM node:20-slim
WORKDIR /usr/src/app
COPY package.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm install
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start"]
