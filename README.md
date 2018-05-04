# Discord PUBG Stats Sprayer
This is a bot for your Discord server. The idea for this bot is: For example, you start to play PUBG (alone or with others). You tell the bot who has started playing. Then the bot checks in a short interval, if there are any new stats available for newly played matches. As soon as it finds a new match result, it will post the stats(i.e. damage and kills, maybe more in the future) of that played match in Discord. Whenever you decide to stop playing, you can tell the bot that you've stopped and it will post an overview of the matches played, with for example average/total damage and kills done.
## Setup
`cp .env.dist .env` and add your own tokens.

## Running the bot
`docker-compose up`

### Feature progress:
- [ ] Start play session.
- [ ] Stop play session (also automatically after 4-6 hours?) (with end details like total damage and kills this session).
- [ ] Show last match of player (in case the session didn't start yet).
- [ ] Add players to the current play session (or maybe ask that when starting to track, but we need this command to add players if they come later into the session).
- [ ] Remove player from the current play session.
- [ ] Interval check every 5-15 minutes for any completed matches for all the players in the current play session.

#### Feature/code to do:
- [x] Dynamically load commands
- [x] Use the bot prefix
- [x] Saving data of a user
- [ ] Make commands dependent on certain data/commands
- [ ] Maybe a better way of adding methods to the Schema(s)
- [ ] Rich format of the stats
- [ ] Multi-language support
- [ ] Add a proper logger
- [ ] Able to set a output channel for all match results
- [ ] ping command
- [ ] help command
- [ ] Start session command
- [ ] Stop session command
- [ ] Add players to session command
- [ ] remove players from session command
- [ ] last match stats in rich format
- [ ] Check for new matches and report to a channel
- [ ] Production docker(-compose) files
- [ ] Deploy to a server
- [ ] When the bot posts the results, and there is a chicken dinner. post a random chicken dinner picture? or some kind of chicken dinner GIF.