const { Events, EmbedBuilder } = require('discord.js');
const db = require("croxydb");
const { CheckURL } = require('../utils/check');
const { UserData } = require('../data/User');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isModalSubmit()) return;
		const { client, customId } = interaction;
		const guildData = db.fetch(`uptime.guilds.guild_${interaction.guild.id}.channel`)
		if (customId === "addLinkForm") {
			if (!guildData) {
				return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setDescription(`> ${client.emoji.error} Bu sunucuda uptime sistemi kapalı!`)] });
			}
			const link = interaction.fields.getTextInputValue("addLinkText")
			const data = db.get(`uptime.user_${interaction.user.id}.links`) || []
			const allLinks = db.get(`uptime.links`) || []
            const userPremium = db.get(`uptime.premiums`) || []
			if (data.includes(link) || allLinks.includes(link)) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`> ${client.emoji.error} Eklemeye çalıştığınız link zaten sistemde ekli!`)
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
		} else if (customId === "removeLinkForm") {
			if (!guildData) {
				return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setDescription(`> ${client.emoji.error} Bu sunucuda uptime sistemi kapalı!`)] });
			}
			const link = interaction.fields.getTextInputValue("removeLinkText")
			const data = db.get(`uptime.user_${interaction.user.id}.links`)
			const allLinks = db.get(`uptime.links`) || []
			if (!data.includes(link) || !allLinks.includes(link)) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`> ${client.emoji.error} Silmeye çalıştığınız link size ait değil veya sistemde böyle bir link yok!`)
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
		}
	},
};