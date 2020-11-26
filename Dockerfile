FROM node:10

#Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copying source files 
COPY . .

#Building app
RUN npm run build

CMD ["npm", "start"]



