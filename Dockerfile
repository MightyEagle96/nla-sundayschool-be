FROM node:20

WORKDIR /usr/src/app

# Copy package.json first (to cache dependencies)
COPY package*.json ./

RUN npm install --production

# Copy only the compiled JS (dist) and anything else needed
COPY dist ./dist

EXPOSE 4000

CMD ["node", "dist/app.js"]
