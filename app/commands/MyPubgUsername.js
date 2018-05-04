'use strict';
const Player = require('../schema/Player.js');
const prefix = process.env.BOT_PREFIX;

// Adding and getting the PUBG username
class MyPubgUsername {
    constructor() {
        this.aliases = [
            `MyPUBGUsername`,
            `MyPUBGusername`,
            `MyUsername`,
            `un`,
        ];
        this.name = `MyPubgUsername`;
    }
    execute(client, message, args, options) {
        if (args.length === 0) {
            Player.methods.findPlayerInDatabase(message.author.id, message.author.username).then(result => {
                if (typeof result.pubg === 'undefined' || !result.pubg.username) {
                    message.reply(`I'm sorry, I don't know your PUBG username yet.\nPlease tell me your username by typing: \`${prefix}${this.name} yourPUBGusernameHERE\``);
                } else {
                    message.reply(`According to me, your PUBG username is: ${result.pubg.username}`);
                }
            });
        } else if (args.length === 1) {
            Player.methods.findPlayerInDatabase(message.author.id, message.author.username).then(result => {
                if (!result) {
                    console.log("NO RESULT???", result);
                } else {
                    result.pubg.username = args[0];
                    result.pubg.id = null;
                    result.save(function (err) {
                        if (err){
                            console.log('FAILED', err);
                        }
                        console.log('Saved Player', result);
                    });
                }
            });
            message.reply("Your PUBG username is set to: " + args[0]);
        }
    }
}

module.exports = new MyPubgUsername();