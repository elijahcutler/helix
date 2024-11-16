# Use a Node.js base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire web app to the working directory
COPY . .

# Expose the app’s port
EXPOSE 3000

# Run the web app
CMD ["npm", "run", "dev"]
