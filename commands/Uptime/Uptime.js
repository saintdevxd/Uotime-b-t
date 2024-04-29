const db = require('croxydb');
const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { UserData } = require('../../data/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Sunucuya uptime sistemi kurar.')
        .addSubcommand(x => x
            .setName("ayarla").setDescription("Sunucuya uptime sistemi kurar.")
            .addChannelOption(x =>
                x.setName("channel").setDescription("Uptime sistemi hangi kanala kurulacak?").setRequired(true).addChannelTypes(ChannelType.GuildText))
        )
        .addSubcommand(x => x
            .setName("sıfırla").setDescription("Sunucudaki uptime sistemini kapatır.")),
    async execute(interaction) {
        const client = interaction.client;
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`> ${client.emoji.error} Bu komutu sen kullanamazsın!`)
                ]
            })
        }

        const cmd = interaction.options.getSubcommand()
        if (cmd == "ayarla") {
            const data = db.fetch(`uptime.guilds.guild_${interaction.guild.id}.channel`)
            if (!data) {
                const channel = interaction.options.getChannel("channel")
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("add_link")
                            .setLabel("Link Ekle")
                            .setEmoji(client.emoji.online)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId("delete_link")
                            .setLabel("Link Sil")
                            .setEmoji(client.emoji.offline)
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId("list_link")
                            .setLabel("Linklerim")
                            .setEmoji(client.emoji.link)
                            .setStyle(ButtonStyle.Primary)
                    )
                db.set(`uptime.guilds.guild_${interaction.guild.id}.channel`, channel.id)
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> ${client.emoji.success} Uptime sistemi başarıyla ${channel} kanalına ayarlandı!`)
                    ]
                })

                channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(interaction.guild.name)
                            .setThumbnail(interaction.guild.iconURL())
                            .setDescription(`
> ${client.emoji.bot} Projeni **7/24** yapmak için alttaki butonları kullanabilirsin!

> ${client.emoji.online} Aşağıdaki **Link Ekle** butonuna tıklayarak projeni ekleyebilirsin!

> ${client.emoji.offline} Aşağıdaki **Link Sil** butonuna tıklayarak projeni kaldırabilirsin!

> ${client.emoji.link} Aşağıdaki **Linklerim** butonuna tıklayarak eklemiş olduğun projeleri görürsün!
`)
                            .setFooter({ text: `${client.user.username} ~ Fr3zy`, iconURL: client.user.displayAvatarURL() })
                    ], components: [row]
                })
            } else {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> ${client.emoji.error} Uptime sistemi zaten bu sunucuda ayarlı! Sıfırlamak için \`/uptime sıfırla\` komutunu kullanın!`)
                    ]
                })
            }
        }
    },
};