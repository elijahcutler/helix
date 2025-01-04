import discord

import json
import subprocess
import os

bot = discord.Bot()

server = bot.create_group("server", "Manage server")

emoji_state = {
    "created": "💦👶🏻",
    "running": "🟢",
    "paused": "⏸️",
    "restarting": "🔃",
    "exited": "🔴",
    "removing": "🚮",
    "dead": "❌"
}

def is_container_running(container_name):
    result = subprocess.run(['docker', 'container', 'inspect', '--format', '\'{{json .State.Running }}\'', container_name], stdout=subprocess.PIPE)
    return result.stdout == 'true'

def format_container_status_response(container_name, action):
    if is_container_running(container_name):
        return f'({container_name}) has {action}ed!'
    else:
        return f'({container_name}) failed to {action}.'
    
####################################################################################################

container_controls = discord.SlashCommandGroup("container_controls", "Manage application state")

# Start
@container_controls.command()
async def start(ctx, container_name: discord.Option(str)):
    await ctx.respond(f"Starting {container_name}...")
    subprocess.run(['docker', 'container', 'start', container_name])
    await ctx.send(format_container_status_response(container_name, "start"))

# Restart
@container_controls.command()
async def restart(ctx, container_name: discord.Option(str)):
    await ctx.respond(f"Restarting {container_name}...")
    subprocess.run(['docker', 'container', 'restart', container_name])
    await ctx.send(format_container_status_response(container_name, "restart"))

# Stop
@container_controls.command()
async def stop(ctx, container_name: discord.Option(str)):
    await ctx.respond(f"Stopping {container_name}...")
    subprocess.run(['docker', 'container', 'stop', container_name])
    await ctx.send(format_container_status_response(container_name, "stop"))

# Status
@container_controls.command()
async def status(ctx, container_name: discord.Option(str)):
    if is_container_running(container_name):
        await ctx.send(f'({container_name}) running!')
    else:
        await ctx.send(f'({container_name}) stopped.')

@bot.command(description="Gets a current list of all available apps.")
async def list_apps(ctx):
    result = subprocess.run(['docker', 'container', 'ls', '-a', '--format', 'json'], stdout=subprocess.PIPE)

    containers = []
    for line in result.stdout.decode("utf-8").splitlines():
        container_info = json.loads(line)
        name = container_info["Names"]
        state = emoji_state.get(container_info["State"], "❔")

        containers.append(f"{name} | {state}")

    await ctx.respond("\n".join(containers))

bot.add_application_command(container_controls)

####################################################################################################

bot_token = os.getenv('DISCORD_BOT_TOKEN')

if bot_token:
    bot.run(bot_token)
else:
    print('Error: DISCORD_BOT_TOKEN environment variable not set.')
    exit(1)