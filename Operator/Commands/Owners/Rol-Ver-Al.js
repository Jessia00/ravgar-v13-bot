const {
    MessageEmbed,
    Discord
} = require("discord.js");
const conf = client.ayarlar
let mongoose = require("mongoose");
let rollog = require("../../models/rollog");
const sunucuayar = require("../../models/sunucuayar");
const bannedRole = require("../../models/bannedRole");
let moment = require("moment");
moment.locale("tr");
module.exports.run = async (client, message, args, durum, kanal) => {
	if (!message.guild) return;
    
    let sunucuData = await sunucuayar.findOne({})
    logChannel = sunucuData.ROLEChannel
    await rollog.find({
        userID: message.author.id
    }, async (err, data) => {
        if (sunucuData.GKV.some(i => i == message.author.id) || message.author.id === message.guild.ownerID || message.member.permissions.has("ADMINISTRATOR") || durum) {

            let sec = args[0]
            let target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            let role = message.guild.roles.cache.get(args[2]) || message.guild.roles.cache.get(args[1])
            let roller = await bannedRole.findOne({guildID: message.guild.id}) || {
                BanRole: []
            }
            let embeddd = new MessageEmbed().setColor("RANDOM")
            if (sec === "ver") {
                if (!target) return message.reply(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Üye Belirt.\` Lütfen geçerli bir üye belirt ve tekrar dene.`);
                if (!role) return message.reply(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Rol Belirt.\` Lütfen geçerli bir rol belirt ve tekrar dene.`)
                if (roller.BanRole.some(x => x == role.id)) return message.reply(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Yasaklı Rol.\` Belirttiğin rol yasaklı roller listesinde.`)
                if (target.roles.cache.get(role.id)) return message.reply(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Zaten var.\` Belirttiğin rol üyede zaten var.`)

                let newData = new rollog({
                    userID: message.author.id,
                    Member: target.id,
                    Type: "[EKLENDİ]",
                    Zaman: Date.now(),
                    Role: role.id
                })
                newData.save()
                target.roles.add(role)
                message.channel.send({embeds: [embeddd.setDescription(`${message.author} adlı yetkili ${target} adlı üyeye ${role} rolünü verdi`)]})
                client.channels.cache.get(logChannel).send({embeds:[new MessageEmbed().setColor("RANDOM").setDescription(`
**${target}** (\`${target.id}\`) adlı üyeye bir rol eklendi:

**Rolü Ekleyen Yetkili:** ${message.author} (\`${message.author.id}\`)
**Verilen Rol:** ${role} (${role.id})

**Detaylı Bilgi İçin:** \`${conf.prefix[0]}r bilgi ${message.author.id}\``)]})
}

            if (sec === "al") {
                if (!target) return message.reply(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Üye Belirt.\` Lütfen geçerli bir üye belirt ve tekrar dene.`);
                if (!role) return message.reply(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Rol Belirt.\` Lütfen geçerli bir rol belirt ve tekrar dene.`)
                if (roller.BanRole.some(x => x == role.id)) return message.reply(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Yasaklı Rol.\` Belirttiğin rol yasaklı roller listesinde.`)
                if (!message.guild.members.cache.get(target.id).roles.cache.get(role.id)) return message.reply(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Zaten yok.\` Belirttiğin rol üyede zaten yok.`)

                let newData = new rollog({
                    userID: message.author.id,
                    Member: target.id,
                    Type: "[ALINDI]",
                    Zaman: Date.now(),
                    Role: role.id
                })
                newData.save()
                client.channels.cache.get(logChannel).send({embeds:[new MessageEmbed().setColor("RANDOM").setDescription(`
**${target}** (\`${target.id}\`) adlı üyeden bir rol aldı:

**Rolü Alan Yetkili:** ${message.author} (\`${message.author.id}\`)
**Alınan Rol:** ${role} (${role.id})

**Detaylı Bilgi İçin:** \`${conf.prefix[0]}r bilgi ${message.author.id}\``)]})
                message.channel.send({embeds: [embeddd.setDescription(`${message.author} adlı yetkili ${target} adlı üyeden ${role} rolünü aldı`)]})
                target.roles.remove(role)
            }
            if (sec === "yasaklı") {
                if (sunucuData.GKV.some(i => i == message.author.id) || message.author.id === message.guild.ownerID) {
                    let rols = args.splice(1).join(" ");
                    let rols2 = rols.split(" ").map(rol => message.guild.roles.cache.get(rol.replace("<@&", "").replace(">", "")).id);
                    
                    rols2.map(async x => {
                        if (roller.BanRole.some(rol => rol === x)) return message.reply("<@&"+x +"> Bu rol zaten yasaklı roller listesinde o yüzden eklemedim!");
                        await bannedRole.updateOne({guildID: message.guild.id}, {$push: {BanRole: x}}, {upsert: true});
                        return message.reply("Başarılı bir şekilde <@&" + x + "> adlı rolü yasaklı roller listesine ekledin!")
                    })

                    
                } else return message.reply("Bu komutu sadece GK kullanıcıları kullanabilir.");
            }


            if (sec == "bilgi") {

                data.reverse();
                let komutlar = data ? data.map(kmt => `\`[${moment(kmt.Zaman).format('LLL')}]\`\n${kmt.Type.replace("[EKLENDİ]", `**[++]**`).replace("[ALINDI]", `**[--]**`)} (<@${kmt.Member}>) (<@&${kmt.Role}>)`) : ["\`\`\`Datacenter'da kaydedilen bir veri görüntülenemedi\`\`\`"];
                const emojis = komutlar
                async function list(listMsg, page, increment) {
                    const entries = Object.entries(emojis);
                    var embed = new MessageEmbed()
                        .setColor(1056085)
                        .setDescription(`${target}`)
                        .setFooter(`Sayfa ${page}/${Math.ceil(entries.length/increment)}`)
                        .setTimestamp(listMsg ? listMsg.createdAt : undefined);


                    const stringField = [];

                    for (let [emoji, string] of entries.slice((page - 1) * increment, (page * increment))) {
                        stringField.push(string);
                    }
                    embed.addField(`Rol \`Verme/Alma\` Kayıtları`, stringField.join('\n'), true);
                    if (listMsg) await listMsg.edit({embeds: [embed]});
                    else listMsg = await message.channel.send({embeds: [embed]});
                    const lFilter = (reaction, user) => reaction.emoji.name === '◀' && page !== 1 && user.id === message.author.id;
                    const lCollector = listMsg.createReactionCollector(lFilter, {
                        max: 1
                    });

                    lCollector.on('collect', async () => {
                        rCollector.stop();
                        await listMsg.reactions.removeAll();
                        list(listMsg, page - 1, increment);
                    });

                    const rFilter = (reaction, user) => reaction.emoji.name === '▶' && entries.length > page * increment && user.id === message.author.id;
                    const rCollector = listMsg.createReactionCollector(rFilter, {
                        max: 1
                    });

                    rCollector.on('collect', async () => {
                        lCollector.stop();
                        await listMsg.reactions.removeAll();
                        list(listMsg, page + 1, increment);
                    });

                    if (page !== 1) await listMsg.react('◀');
                    if (entries.length > page * increment) await listMsg.react('▶');
                }
                list(undefined, 1, 10)
                    .catch(console.error);
            }



            if (!sec) return;


        } else {
            return message.reply(
                "Bu komut sadece TAÇ sahibi tarafından kullanılabilir"
            );
        }
    })
}
exports.conf = {aliases: ["r", "rol"]}
exports.help = {name: 'rolver'}
