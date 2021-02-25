require('dotenv').config();

const { Client, WebhookClient, Webhook } = require('discord.js');
const client = new Client({
    partials: ['MESSAGE', 'REACTION']
});

//TEEMO STUFF
const TeemoJS = require('teemojs');
// put api here
let api = TeemoJS('API GOES HERE');
  // END TEEMO STUFF

  var request = require('request');

const webhookClient = new WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);

const PREFIX = "$";

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});

client.on('message', async (message) => {
    if (message.author.bot == true) return;
    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);

        // kick person
        if (CMD_NAME === 'kick') {
            if (!message.member.hasPermission('KICK_MEMBERS')) {
                return message.reply('You do not have persmission to use this command');
            }
            if (args.length === 0) {
                return message.reply('Please provide an ID');
            }
            const member = message.guild.members.cache.get(args[0]);
            if (member) {
                member
                .kick()
                .then((member) => message.channel.send(`${member} was kicked.`))
                .catch((err) => message.channel.send('I do not have permissions to kick that user.'));
            } else {
                message.channel.send('That member was not found');
            }

            // ban person
        } else if (CMD_NAME === 'ban') {
            if (!message.member.hasPermission('BAN_MEMBERS')) {
                return message.reply('You do not have persmission to use this command');
            }
            if (args.length === 0) {
                return message.reply('Please provide an ID');
            }
            
            try {
                const user = await message.guild.members.ban(args[0]);
                message.channel.send('User was banned successfully')
            } catch (err) {
                console.log(err);
                message.channel.send('An error occured');
            }

            // announcement
        } else if (CMD_NAME === 'announce') {
            const msg = args.join(' ');
            webhookClient.send(msg);

            // returns encrypted summoner ID
        } else if (CMD_NAME === 'getESID') {
            try {
                api.get('na1', 'summoner.getBySummonerName', args[0]).then(data => message.channel.send(data.name + "'s encrypted summoner id is " + data.id + '.'));
            } catch (err) {
                console.log(err);
                message.channel.send('An error occured');
            }

            // returns all functions
        }else if (CMD_NAME === 'help') {
            try {
                message.channel.send("$chest [summonerName] [championName]-> checks if chest is available for given champion");
                message.channel.send("$level [summonerName] -> returns summoner level");
                message.channel.send("$mastery [summonerName] [championName]-> returns champ mastery of given champion");
                message.channel.send("Functions below aren't useful to you:");
                message.channel.send("$getESID [summonerName] -> returns encrypted summoner ID");
                message.channel.send("$getAccountID [summonerName] -> returns account ID");
            } catch (err) {
                console.log(err);
                message.channel.send('An error occured');
            }

            // returns account ID
        } else if (CMD_NAME === 'getAccountID') {
            try {
                api.get('na1', 'summoner.getBySummonerName', args[0]).then(data => message.channel.send(data.name + "'s account id is " + data.accountId + '.'));
            } catch (err) {
                console.log(err);
                message.channel.send('An error occured');
            }

            // returns summoner level
        } else if (CMD_NAME === 'level') {
            try {
                api.get('na1', 'summoner.getBySummonerName', args[0]).then(data => message.channel.send(data.name +  " is level "  + data.summonerLevel + '.'));
            } catch (err) {
                console.log(err);
                message.channel.send('An error occured');
            }

            // returns champ level
        }else if (CMD_NAME === 'mastery') {
            try {
                var summonerID;
                var champID;
                // convert champ name to its unique ID
                request('http://ddragon.leagueoflegends.com/cdn/' + '9.3.1' + '/data/en_US/champion.json', function (error, response, body) {
                    let list = JSON.parse(body);
                    let championList = list.data;
                    for (var i in championList) {
                        if (championList[i].name == args[1]) {
                            console.log(championList[i].key);
                            //message.channel.send("loop: name is " + championList[i].name);
                            //message.channel.send("loop: key is " + championList[i].key);
                            champID = championList[i].key;
                            //callback(champID);
                        };
                    //console.log(championList[i].id + " | " + championList[i].key);
                    }
                });
                // convert summoner name to encrypted summoner ID
                await api.get('na1', 'summoner.getBySummonerName', args[0]).then(data => {
                    summonerID = data.id; 
                    //callback(summonerID);
                });
                //await message.channel.send("Channel Summoner ID: " + summonerID);
                console.log("Console Summoner ID: " + summonerID);
                //await message.channel.send("Channel Champ ID: " + champID);
                console.log("Console Champ ID: " + champID);
                //await message.channel.send("Channel Summoner ID: " + summonerID);
                //console.log("Console Summoner ID: " + summonerID);

                // check if user got a chest on this champion
                await api.get('na1', 'championMastery.getChampionMastery', summonerID, champID)
                .then(data => {
                    message.channel.send("You are level " + data.championLevel + " on " + args[1]);
                });
            } catch (err) {
                console.log(err);
                message.channel.send('An error occured');
            }

            // determines if a chest is available for the champion
        } else if (CMD_NAME === 'chest') {
            try {
                var summonerID;
                var champID;
                // convert champ name to its unique ID
                request('http://ddragon.leagueoflegends.com/cdn/' + '9.3.1' + '/data/en_US/champion.json', function (error, response, body) {
                    let list = JSON.parse(body);
                    let championList = list.data;
                    for (var i in championList) {
                        if (championList[i].name == args[1]) {
                            console.log(championList[i].key);
                            //message.channel.send("loop: name is " + championList[i].name);
                            //message.channel.send("loop: key is " + championList[i].key);
                            champID = championList[i].key;
                            //callback(champID);
                        };
                    //console.log(championList[i].id + " | " + championList[i].key);
                    }
                });
                // convert summoner name to encrypted summoner ID
                await api.get('na1', 'summoner.getBySummonerName', args[0]).then(data => {
                    summonerID = data.id; 
                    //callback(summonerID);
                });
                //await message.channel.send("Channel Summoner ID: " + summonerID);
                console.log("Console Summoner ID: " + summonerID);
                //await message.channel.send("Channel Champ ID: " + champID);
                console.log("Console Champ ID: " + champID);
                //await message.channel.send("Channel Summoner ID: " + summonerID);
                //console.log("Console Summoner ID: " + summonerID);

                // check if user got a chest on this champion
                await api.get('na1', 'championMastery.getChampionMastery', summonerID, champID)
                .then(data => {
                    if (data.chestGranted) {
                        message.channel.send(args[1] + ": No chest");
                    } else {
                        message.channel.send(args[1] + ": Chest available");
                    }
                });
            } catch (err) {
                console.log(err);
                message.channel.send('An error occured');
            }

            // TEST FUNCTION
        } else if (CMD_NAME === 'test') {
            var cName;
            var version = '9.3.1';
            try {
                //api.get('na1', 'championMastery.getAllChampionMasteries', args[0]).then(data => message.channel.send(data[0].championID));
                //api.get('na1', 'match.getMatchlist', 78247, { champion: [81, 429], season: 8 }).then(data => message.channel.send());
                //var sumName = api.get('na1', 'summoner.getBySummonerName', args[0]);
                //api.get('na1', 'league.getLeagueEntriesForSummoner', args[0])
                //.then(data => message.channel.send(data + " " + data.summonerName +  " is "  + data.tier + " " + data.rank + ' in ' + data.queueType + "."));
                request('http://ddragon.leagueoflegends.com/cdn/' + version + '/data/de_DE/champion.json', function (error, response, body) {
                    let list = JSON.parse(body);
                    let championList = list.data;
                    for (var i in championList) {
                        if (championList[i].key == args[1]) {
                            //console.log(championList[i].id)
                            cName = championList[i].name;
                            }
                        //console.log(championList[i].id + " | " + championList[i].key);
                        }
                  
                });
                api.get('na1', 'championMastery.getChampionMastery', args[0], args[1])
                .then(data => {
                    if (data.chestGranted) {
                        message.channel.send(cName + ": No chest available.");
                    } else {
                        message.channel.send("Chest available for " + cName + '.');
                    }
                });

            } catch (err) {
                console.log(err);
                message.channel.send('An error occured');
            }
        } else {
            message.channel.send('Invalid command.');
        }
    }

    

});

client.on('messageReactionAdd', (reaction, user) => {
    const { name } = reaction.emoji;
    const member = reaction.message.guild.members.cache.get(user.id);
    if (reaction.message.id === '813524007482687500') {
        switch (name) {
            case '👑':
                member.roles.add('813525671878983681');
                break;
            case '💩':
                member.roles.add('813525715047546940');
                break;
        }
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    const { name } = reaction.emoji;
    const member = reaction.message.guild.members.cache.get(user.id);
    if (reaction.message.id === '813524007482687500') {
        switch (name) {
            case '👑':
                member.roles.remove('813525671878983681');
                break;
            case '💩':
                member.roles.remove('813525715047546940');
                break;
        }
    }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);

