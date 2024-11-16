# Helix

## Seamless Control of Your Game Servers and Instances
This app makes it easy to manage game servers running in Docker, AWS EC2 instances, Azure Virtual Machines, and more. With a simple interface, you can start, stop, and monitor your game servers and EC2 instances all in one place, making server management quick and hassle-free.

### IMPORTANT
This app is intended to be run locally on a secure host that is not accessible to any unauthorized external users. The initial deployment does not provide a secure method for importing or storing your AWS access keys. Nothing is encrypted locally. It's your responsibility to ensure that your keys have the most appropriate, least-privileged permissions within your AWS account to maintain security.

## Features
- **AWS Authentication:** Supports AWS credentials via manual input, JSON file upload, and CSV file upload.
- **EC2 Instance Management:** Displays instance name, status, uptime, and public IP.
- **Light and Dark Mode Support:** The UI adjusts based on the user's system preferences.
- **Persistent Credentials:** AWS credentials are stored locally for convenience across sessions.
- **Game Server Management:** Easy control and monitoring of your Linux GSM game servers and EC2 instances.

## What's Done
- **AWS Authentication:** Fully functional AWS credential input and storage.
- **EC2 Instance Display:** Displays instance name, state (with uptime), and public IP.
- **API Integration:** Backend API for retrieving EC2 instance data.
- **Dark/Light Mode:** The UI adapts to the user's theme preference.

## What's WIP
- **Start/Stop EC2 Instances:** Ability to remotely start and stop EC2 instances directly from the dashboard.
- **Game Server Management:** Integrating controls for Linux GSM game servers.
- **Enhanced Error Handling:** Improving the user experience by providing detailed error messages and handling edge cases.
- **UI Enhancements:** Further UI/UX improvements to make the application more intuitive and visually appealing.

## Local Setup

Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/elijahcutler/helix.git
   cd helix

2. **Install dependencies:**
   ```bash
   npm install

4. **Run the development server:**
   ```bash
   npm run dev

5. **Open the app in your browser:**
  - Navigate to http://localhost:3000 to view the application.


## Using AWS/Azure Virtual Machine Management & Discord (IN PROGRESS)

Runs a Discord bot that waits for commands in a channel of your choosing.

## Explanation
### !startmc
- checks if VM is running
- if not, starts VM and waits for a Minecraft server to start.
- this assumes you have a systemd service on your VM that launches the server .jar upon boot up.
### !stopmc
- sends a 'stop' command via RCON to the Minecraft server console (requires hostname, port, and rcon password).
- sends a power-off request to the VM
- note: only users with the provided 'approved-role' in Discord can initiate this command.
