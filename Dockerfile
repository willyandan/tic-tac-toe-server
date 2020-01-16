FROM node:10
WORKDIR /app
COPY package* ./
RUN npm install
RUN npm install -g nodemon
COPY . .
CMD [ "npm", "run", "dev" ]
EXPOSE 3000