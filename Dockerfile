FROM mhart/alpine-node:5.9.0

RUN npm install --production

COPY . /src

EXPOSE 8080

CMD npm start