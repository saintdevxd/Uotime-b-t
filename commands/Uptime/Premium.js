const db = require('croxydb');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { BotData } = require('../../data/Bot');
const ms = require('ms');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Premium komutları.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ver')
                .setDescription('Bir kullanıcıya premium verir.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Premium verilecek kullanıcı.')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('al')
                .setDescription('Bir kullanıcının premiumunu alır.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Premium\'u alınacak kullanıcı.')
                        .setRequired(true))
        ),
    async execute(interaction) {
        if (!BotData.owners.includes(interaction.user.id)) {
            return interaction.reply({ content: `> ${interaction.client.emoji.error} Bu komutu sadece bot sahibi kullanabilir!`, ephemeral: true });
        }
        const cmd = interaction.options.getSubcommand()
        if (cmd === "ver") {
            const user = interaction.options.getUser('user');

            const premiums = db.get(`uptime.premiums`) || [];

            if (premiums.includes(user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`> ${interaction.client.emoji.error} ${user.tag}'ın zaten premiumu var.`);
                return interaction.reply({ embeds: [embed] });
            }

            db.push(`uptime.premiums`, user.id);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`> ${interaction.client.emoji.success} Premium ${user.tag}'a verilmiştir.`);

            interaction.reply({ embeds: [embed] });
        } else if (cmd === "al") {
            const user = interaction.options.getUser('user');

            const premiums = db.get(`uptime.premiums`) || [];
            if (!premiums.includes(user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`> ${interaction.client.emoji.error} ${user.tag} doesn't have premium.`);
                return interaction.reply({ embeds: [embed] });
            }

            db.unpush(`uptime.premiums`, user.id);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`> ${interaction.client.emoji.success} Premium has been removed from ${user.tag}`);
            interaction.reply({ embeds: [embed] });

        }
    }
}