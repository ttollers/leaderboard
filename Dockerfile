FROM node:latest

# Install app dependencies
RUN npm install yarn -g
COPY package.json /src/package.json

# Bundle app source
COPY . /src

WORKDIR /src
RUN yarn --production

EXPOSE 8080
CMD [ "npm", "start" ]
