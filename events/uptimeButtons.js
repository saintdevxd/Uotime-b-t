const { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const db = require("croxydb");
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		const { client, customId } = interaction;
		const data = db.fetch(`uptime.guilds.guild_${interaction.guild.id}.channel`)

		const addLinkModal = new ModalBuilder()
			.setCustomId('addLinkForm')
			.setTitle('Proje Ekle')
		const addLinkForm = new TextInputBuilder()
			.setCustomId('addLinkText')
			.setLabel('Proje linkinizi giriniz.')
			.setStyle(TextInputStyle.Paragraph)
			.setMinLength(16)
			.setMaxLength(60)
			.setPlaceholder('Proje Linikiniz')
			.setRequired(true)
		const addLinkSystem = new ActionRowBuilder().addComponents(addLinkForm);
		addLinkModal.addComponents(addLinkSystem);

		const removeLinkModal = new ModalBuilder()
			.setCustomId('removeLinkForm')
			.setTitle('Proje Sil')
		const removeLinkForm = new TextInputBuilder()
			.setCustomId('removeLinkText')
			.setLabel('Proje linkinizi giriniz.')
			.setStyle(TextInputStyle.Paragraph)
			.setMinLength(16)
			.setMaxLength(60)
			.setPlaceholder('Proje Linikiniz')
			.setRequired(true)
		const removeLinkSystem = new ActionRowBuilder().addComponents(removeLinkForm);
		removeLinkModal.addComponents(removeLinkSystem);

		if (customId === "add_link") {
			if (!data) {
				return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setDescription(`> ${client.emoji.error} Bu sunucuda uptime sistemi kapalı!`)] });
			}

			interaction.showModal(addLinkModal);
		} else if (customId === "delete_link") {
			if (!data) {
				return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setDescription(`> ${client.emoji.error} Bu sunucuda uptime sistemi kapalı!`)] });
			}

			interaction.showModal(removeLinkModal);
		} else if (customId === "list_link") {
			if (!data) {
				return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setDescription(`> ${client.emoji.error} Bu sunucuda uptime sistemi kapalı!`)] });
			}
			const allLinks = db.get(`uptime.user_${interaction.user.id}.links`) || [];
			if (allLinks.length === 0) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`> ${client.emoji.error} Sisteme hiç link eklememişsiniz!`)
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

${linksList}
						`)
						.setColor('Random')
				], ephemeral: true
			});
		}
	},
};