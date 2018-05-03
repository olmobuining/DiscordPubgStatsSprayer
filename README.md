# Discord PUBG Stats Sprayer

## Setup
`cp .env.dist .env` and add your own tokens.

## Running the bot
`docker-compose up`

### Features to do:
- [ ] Start play session.
- [ ] Stop play session (also automatically after 4-6 hours?) (with end details like total damage and kills this session).
- [ ] Show last match of player (in case the session didnt start yet).
- [ ] Add players to the current play session (or maybe ask that when starting to track, but we need this command to add players if they come later into the session).
- [ ] Remove player from the current play session.
- [ ] Interval check every 5-15 minutes for any completed matches for all the players in the current play session.

### General coding to do:
- [ ] Dynamically load commands
- [ ] Use the bot prefix
- [ ] Saving data of a user