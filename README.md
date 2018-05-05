# Discord PUBG Stats Sprayer
This is a bot for your Discord server. The idea for this bot is: For example, you start to play PUBG (alone or with others). You tell the bot who has started playing. Then the bot checks in a short interval, if there are any new stats available for newly played matches. As soon as it finds a new match result, it will post the stats(i.e. damage and kills, maybe more in the future) of that played match in Discord. Whenever you decide to stop playing, you can tell the bot that you've stopped and it will post an overview of the matches played, with for example average/total damage and kills done.
## Setup
`cp .env.dist .env` and add your own tokens.

## Running the bot
`docker-compose up`

### Feature progress:
- [x] Start play session.
- [x] Stop play session (also automatically after 4-6 hours?) (with end details like total damage and kills this session).
- [x] Show last match of player (in case the session didn't start yet).
- [ ] Add players to the current play session (or maybe ask that when starting to track, but we need this command to add players if they come later into the session).
- [ ] Remove player from the current play session.
- [ ] Interval check every 5-15 minutes for any completed matches for all the players in the current play session.