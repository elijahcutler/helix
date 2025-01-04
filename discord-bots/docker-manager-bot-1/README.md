# Discord Docker Management Bot

A simple Discord bot built using `py-cord` that allows users to manage a game server (or anything) running in a Docker container. This bot provides commands to start, stop, restart, and check the status of the server directly from Discord.

## Features

- Start
- Stop
- Restart
- Check status

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8 or higher (3.13 recommended)
- Docker
- Discord bot with appropriate slash commands permissions

## Environment Variables

This bot requires two environment variables to be set:

- `DOCKER_CONTAINER_NAME`: The name of the Docker container running the server.
- `DISCORD_BOT_TOKEN`: The token for your Discord bot, which you can obtain from the [Discord Developer Portal](https://discord.com/developers/applications).

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/social-bot.git
   cd social-bot
   ```

2. Create a virtual environment (optional but recommended):

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:

   ```bash
   pip install py-cord
   ```

## Usage

1. Set the environment variables:

   ```bash
   export DOCKER_CONTAINER_NAME='your_minecraft_container_name'
   export DISCORD_BOT_TOKEN='your_discord_bot_token'
   ```

   Alternatively, you can create a `.env` file and use a library like `python-dotenv` to load these variables.

2. Run the bot:

   ```bash
   python bot.py
   ```

## Commands

The following commands can be used in Discord:

- `/server start`: Starts the server.
- `/server stop`: Stops the server.
- `/server restart`: Restarts the server.
- `/server status`: Checks if the server is running.

## Security Considerations

- Ensure your bot has the necessary permissions in your Discord server.
- Use Docker best practices to secure your containers.
- Consider using a non-root user for running the bot inside Docker.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for discussion.

(written with chatGPT, sorry not sorry)
