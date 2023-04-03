const {
    MessageEmbed,
    Discord
} = require("discord.js");
const conf = client.ayarlar;
let mongoose = require("mongoose");
let sunucuayar = require("../../models/sunucuayar");
let teyit = require("../../models/teyit");
let isim_limit = new Map();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    if ((isim_limit.get(message.author.id) || 0) >= 5) return message.reply("5 dakikada en fazla 5 isim değişikliği yapabilirsin.")
    isim_limit.set(message.author.id, (isim_limit.get(message.author.id) || 0)+1)

    setTimeout(() => {
        isim_limit.set(message.author.id, (isim_limit.get(message.author.id) || 0)-1)
    }, 1000*60*5)

    let data = await sunucuayar.findOne({guildID: message.guild.id});
    if(message.member.roles.cache.some(rol => data.REGISTERAuthorized.some(rol2 => rol.id == rol2)) || message.member.permissions.has("ADMINISTRATOR")) {
        let tag = data.TAG
        let tag2 = data.TAG2;
    
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.channel.send(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Üye belirtilmedi.\` Lütfen geçerli bir üye belirt ve tekrar dene.`);
    if (message.member.roles.highest.position <= target.roles.highest.position) return message.channel.send(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Hatalı İşlem.\` Belirttiğin kişi senden üstün veya onunla aynı yetkidesin.`);
    
    if (!args[1]) return message.channel.send(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`İsim Belirtilmedi.\` Lütfen geçerli bir isim belirt ve tekrar dene.`);
    
    let isim = args[1][0].toUpperCase() + args[1].substring(1);
        let yaş = Number(args[2]);
    
        if (!yaş) return message.channel.send(`${client.emojis.cache.find(x => x.name === "ravgar_carpi")} \`Yaş Belirtilmedi.\` Lütfen geçerli bir yaş belirt ve tekrar dene.`);
        let isimler = await teyit.findOne({
            userID: target.id
        });
        await message.guild.member(target.id).setNickname(`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${isim} | ${yaş}`).then(x => message.react(client.emojis.cache.find(x => x.name === "ravgar_tik")))
        await teyit.updateOne({userID: target.id}, {$push: {userName: `\`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${isim} | ${yaş}\` (İsim Güncellendi)`}}, {upsert:true}).exec()
    message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true})).setDescription(`${target} kullanıcısının ismi **${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${isim} | ${yaş}** olarak değiştirildi!
    
    **${isimler.userName.length}** adet isim geçmişi görüntülendi.
    
    ${isimler.userName.map(x => x).reverse().join("\n")}`))
    
    } else return;
};

exports.conf = {
    aliases: ["isim", "İsim", "İSİM", "ISIM"]
};
exports.help = {
    name: 'name'
};