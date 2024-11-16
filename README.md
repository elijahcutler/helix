# Helix

## Seamless Control of Your Game Servers and Instances
This app makes it easy to manage game servers running in Docker, AWS EC2 instances, Azure Virtual Machines, and more. With a simple interface, you can start, stop, and monitor your game servers and EC2 instances all in one place, making server management quick and hassle-free.

### IMPORTANT
This app is intended to be run locally on a secure host that is not accessible to any unauthorized external users. This initial deployment does not provide a secure method for importing or storing your AWS access keys. Nothing is encrypted locally. It's your responsibility to ensure that your keys have the most appropriate, least-privileged permissions within your AWS account to maintain security.

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