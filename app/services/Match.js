const Discord = require('discord.js');
const Pubgapi = require('pubg-api');
const pubg = new Pubgapi(
    process.env.PUBG_API_TOKEN,
    { defaultShard: process.env.DEFAULT_SHARD }
);

class Match {
    constructor(matchId) {
        this.matchId = matchId;
        this.matchData = false;
    }
    fillMatchData() {
        console.log(`Loading match data ${this.matchId} from PUBG.`);
        return pubg.loadMatchById(this.matchId).then(matchData => {
            console.log(`Match data from PUBG`);
            this.matchData = matchData;
            return matchData;
        });
    }
    getMatchData() {
        return new Promise((resolve, reject) => {
            if(!this.matchData) {
                console.log(`Match data was not cached for ${this.matchId}`);
                return resolve(this.fillMatchData().then(matchData => {
                    return matchData;
                }));
            } else {
                console.log(`Match data was cached for ${this.matchId}`);
                return resolve(this.matchData);
            }
        });
    }
    findPlayerData(playerPubgId) {
        return this.getMatchData().then(matchData => {
            console.log(`Found match data and looking for player ${playerPubgId} in this data.`);
            for (let item of matchData.raw.included) {
                if (item.type === "participant" && item.attributes.stats.playerId === playerPubgId) {
                    return item;
                }
            }
            console.log(`Player ${playerPubgId} not found in match data.`);
            return false;
        });
    }
    getRichEmbedFromPlayer(playerPubgId, player) {
        return this.findPlayerData(playerPubgId).then(item => {
            console.log(`Building RichEmbed for player ${playerPubgId}`);
            let damage = Math.round(item.attributes.stats.damageDealt);
            return new Discord.RichEmbed()
                .setTitle(`Here's an overview of your last match.`)
                .addField(`Place`, item.attributes.stats.winPlace, true)
                .addField(`Kills`, item.attributes.stats.kills, true)
                .addField('Damage', damage, true)
                .addField(`DBNOs`, item.attributes.stats.DBNOs, true)
                .addField(`Assists`, item.attributes.stats.assists, true)
                .addField(`Furthest Kill`, item.attributes.stats.longestKill + `m`, true)
                .setAuthor(player.username, player.displayAvatarURL)
                .setURL(`https://pubg.op.gg/user/${player.pubg.username}?server=eu`)
                .setTimestamp(this.matchData.raw.data.attributes.createdAt);
        });
    }
}
module.exports = Match;