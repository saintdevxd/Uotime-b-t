const db = require('croxydb');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { UserData } = require('../../data/User');
const { CheckURL } = require('../../utils/check');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Uptime sistemimize projenizi ekleyin.')
        .addSubcommand(x => x
            .setName("ekle").setDescription("Uptime sistemimize projenizi eklersiniz.")
            .addStringOption(x =>
                x.setName("link").setDescription("Projenizin view linki.").setRequired(true))
        )
        .addSubcommand(x => x
            .setName("sil").setDescription("Uptime sistemimizden projenizi silersiniz.")
            .addStringOption(x =>
                x.setName("link").setDescription("Projenizin view linki.").setRequired(true).setAutocomplete(true))
        )
        .addSubcommand(x => x
            .setName("listele").setDescription("Eklediğiniz tüm projeleri listeler.")
        )
    ,
    async execute(interaction) {
        const client = interaction.client;
        const cmd = interaction.options.getSubcommand()
        if (cmd == "ekle") {
            const link = interaction.options.getString("link")
            const data = db.get(`uptime.user_${interaction.user.id}.links`) || []
            const allLinks = db.get(`uptime.links`) || []
            const userPremium = db.get(`uptime.premiums`) || []
            if (data.includes(link) || allLinks.includes(link)) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> ${client.emoji.error} Eklemeye çalıştığınız link zaten ekli!`)
                            .setColor('Random')
                    ], ephemeral: true
                })
            }
            if (!userPremium.includes(interaction.user.id)) {
                if (data.length >= UserData.maxAddLink) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`> ${client.emoji.error} Sisteme en fazla **${UserData.maxAddLink}** proje ekleyebilirsiniz! Daha fazla eklemek için premium sahibi olmanız gerekiyor!`)
                                .setColor('Random')
                        ], ephemeral: true
                    })
                }
            } else {
                if (data.length >= UserData.premiumMaxAddLink) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`> ${client.emoji.error} Sisteme en fazla **${UserData.premiumMaxAddLink}** proje ekleyebilirsiniz!`)
                                .setColor('Random')
                        ], ephemeral: true
                    })
                }
            }

            if (!link.startsWith('https://')) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> ${client.emoji.error} Linkin başında \`https://\` olmalıdır!`)
                            .setColor('Random')
                    ], ephemeral: true
                });
            }
            const isValidDomain = UserData.allowedDomains.some(domain => link.endsWith(domain));
            if (!isValidDomain) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> ${client.emoji.error} Geçerli bir domain uzantısı kullanmalısınız! (${UserData.allowedDomains.map(x => `\`${x}\``).join(", ")})`)
                            .setColor('Random')
                    ], ephemeral: true
                });
            }
            const isValidURL = await CheckURL(link);
            if (!isValidURL) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> ${client.emoji.error} Eklemeye çalıştığınız link geçersiz! Lütfen düzgün bir link ile tekrar deneyin!`)
                            .setColor('Random')
                    ],
                    ephemeral: true
                });
            }
            db.push(`uptime.links`, link)
            db.push(`uptime.user_${interaction.user.id}.links`, link)
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`> ${client.emoji.success} Projeniz başarıyla sisteme eklendi!`)
                        .setColor('Random')
                ], ephemeral: true
            })
        } else if (cmd == "sil") {
            const link = interaction.options.getString("link")
            const data = db.get(`uptime.user_${interaction.user.id}.links`)
            const allLinks = db.get(`uptime.links`) || []
            if (!data.includes(link)) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> ${client.emoji.error} Silmeye çalıştığınız link sistemde bulunmuyor!`)
                            .setColor('Random')
                    ], ephemeral: true
                })
            }
            db.unpush(`uptime.links`, link)
            db.unpush(`uptime.user_${interaction.user.id}.links`, link)
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`> ${client.emoji.success} Projeniz başarıyla sistemden silindi!`)
                        .setColor('Random')
                ], ephemeral: true
            })
        } else if (cmd == "listele") {
            const allLinks = db.get(`uptime.links`) || [];
            if (allLinks.length === 0) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> Sistemde henüz herhangi bir proje bulunmamaktadır.`)
                            .setColor('Random')
                    ], ephemeral: true
                });
            }
            const linksList = allLinks.map((link, index) => `> ${client.emoji.link} **${index + 1}. Link:** \`${link}\``).join('\n');
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Uptime Sistemindeki Projeler')
                        .setDescription(`
> ${client.emoji.success} Aşağıda eklediğiniz bütün projeleri görebilirsiniz!

${linksList}`)
                        .setColor('Random')
                ], ephemeral: true
            });
        }
    },
};