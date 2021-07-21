FROM node:latest

# Change working directory
WORKDIR "/app"

# Update packages and install dependency packages for services
RUN apt-get update \
  && apt-get dist-upgrade -y \
  && apt-get clean \
  && echo 'Finished installing dependencies'

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm production packages 
RUN npm install --production

COPY . /app

EXPOSE 3000

USER node

CMD ["npm", "start"]
