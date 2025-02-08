const fs = require('fs');
const path = require('path');
const BotModule = require("../BotModule.js");
const { EmbedBuilder, Client } = require("discord.js");
const { enableCommand, disableCommand, enableCommandCC, disableCommandCC } = require('../botModuleHandler.js');

const adminRole = '1167274324042973194'; 
const commandsFilePath = path.join(__dirname, 'disabledCommands.json');

class AdminCommands extends BotModule {
    prefix = "-";
    
    init() {
        this.commands.push(this.enable);
        this.commands.push(this.disable);
		this.commands.push(this.disabledcommands);
		this.commands.push(this.ping);
		this.commands.push(this.modules);
    }

    onError(error) {
        return false;
    }


	async messageCreate(self, message) {
        const disabledCommands = loadDisabledCommands();

        for (const commandName of Object.keys(disabledCommands)) {
            disableCommand(commandName);
        }
    }

    async disabledcommands(self, message) {
        const disabledCommands = loadDisabledCommands();

        const disabledCommandList = Object.keys(disabledCommands).length
            ? Object.keys(disabledCommands).join(", ")
            : "None";

        const embed = new EmbedBuilder()
            .setTitle("Disabled Commands")
            .setColor(0x00FFFF)
            .addFields(
                { name: "Commands", value: disabledCommandList },
            )
            .setFooter({ text: "Use -enable or -enablecc to re-enable commands." });

        return message.reply({ embeds: [embed] });
    }


    async enable(self, message, args) {
        if (!message.member.roles.cache.has(adminRole)) {
            const noPermissionEmbed = new EmbedBuilder()
                .setTitle("Permission Denied")
                .setColor(0xFF0000) 
                .setDescription("You do not have the required role to use this command.")
                .setFooter({ text: "Contact an admin if this command needs to be disabled" });
                
            return message.reply({ embeds: [noPermissionEmbed] });
        }

        if (!args.length) {
            const missingArgsEmbed = new EmbedBuilder()
                .setTitle("Missing Arguments")
                .setColor(0xFFFF00) 
                .setDescription('Please provide the name of the command to enable.')
                .setFooter({ text: "Usage: `-enable <command>`" });
                
            return message.reply({ embeds: [missingArgsEmbed] });
        }

        const commandName = args[0];
        enableCommand(commandName);

        const successEmbed = new EmbedBuilder()
            .setTitle("Command Enabled")
            .setColor(0x00FF00) 
            .setDescription(`Command "${commandName}" has been enabled.`)
            .setFooter({ text: "The command is now active." });

        updateDisabledCommands(commandName, false);

        return message.reply({ embeds: [successEmbed] });
    }

    async disable(self, message, args) {
        if (!message.member.roles.cache.has(adminRole)) {
            const noPermissionEmbed = new EmbedBuilder()
                .setTitle("Permission Denied")
                .setColor(0xFF0000) 
                .setDescription("You do not have the required role to use this command.")
                .setFooter({ text: "Contact an admin if this command needs to be disabled" });

            return message.reply({ embeds: [noPermissionEmbed] });
        }

        if (!args.length) {
            const missingArgsEmbed = new EmbedBuilder()
                .setTitle("Missing Arguments")
                .setColor(0xFFFF00) 
                .setDescription('Please provide the name of the command to disable.')
                .setFooter({ text: "Usage: `-disable <command>`" });

            return message.reply({ embeds: [missingArgsEmbed] });
        }

        const commandName = args[0];
        disableCommand(commandName);

        const successEmbed = new EmbedBuilder()
            .setTitle("Command Disabled")
            .setColor(0xFF0000) 
            .setDescription(`Command "${commandName}" has been disabled.`)
            .setFooter({ text: "The command is now inactive." });

        updateDisabledCommands(commandName, true);

        return message.reply({ embeds: [successEmbed] });
    }
	
	async ping(self, message, args) {
		const startTime = Date.now();
		message.channel.send("Pinging...").then((sentMessage) => {
			const endTime = Date.now();
			const latency = endTime - startTime;
			sentMessage.edit(
				`Pong! \`${latency}ms\``,
			);
		});
	}
	
		async modules(self, message, args) {
			
		const loadedModules = await listAllModules(); 

		if (loadedModules.length === 0) {
			await message.reply("No modules are currently loaded.");
			return;
		}

		const itemsPerPage = 5; 
		let currentPage = 0;
		const totalPages = Math.ceil(loadedModules.length / itemsPerPage);

		
		const createEmbed = (page) => {
			const start = page * itemsPerPage;
			const end = start + itemsPerPage;
			const modulesPage = loadedModules.slice(start, end);

			const embed = new EmbedBuilder()
				.setTitle('📦 Loaded Modules')
				.setColor(0x00AE86) 
				.setDescription('Here are all the modules currently loaded on this bot:')
				.setFooter({ text: `Page ${page + 1} of ${totalPages}` });

			modulesPage.forEach((mod, index) => {
				const commandsList = mod.commands.map(cmd => `\`${cmd.name}\``).join(', ') || "No commands";

				embed.addFields({
					name: `🔹 Module ${start + index + 1}: ${mod.constructor.name}`,
					value: `**Prefix:** \`${mod.prefix || 'None'}\`\n**Commands:** ${commandsList}`
				});
			});

			return embed;
		};

		
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('previous')
					.setLabel('⬅️ Previous')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentPage === 0), 
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next ➡️')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentPage === totalPages - 1) 
			);

		
		let msg = await message.channel.send({ embeds: [createEmbed(currentPage)], components: [row] });

		
		const filter = (interaction) => {
			return interaction.user.id === message.author.id; 
		};

		const collector = msg.createMessageComponentCollector({ filter, time: 60000 }); 

		collector.on('collect', async (interaction) => {
			if (interaction.customId === 'previous' && currentPage > 0) {
				currentPage--;
			} else if (interaction.customId === 'next' && currentPage < totalPages - 1) {
				currentPage++;
			}

			
			const updatedRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('previous')
						.setLabel('⬅️ Previous')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentPage === 0),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('Next ➡️')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentPage === totalPages - 1)
				);

			
			await interaction.update({ embeds: [createEmbed(currentPage)], components: [updatedRow] });
		});

		collector.on('end', () => {
			
			const disabledRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('previous')
						.setLabel('⬅️ Previous')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('Next ➡️')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true)
				);
			
			msg.edit({ components: [disabledRow] });
		});
	}
}
  function loadDisabledCommands() {
        if (fs.existsSync(commandsFilePath)) {
            const data = fs.readFileSync(commandsFilePath);
            return JSON.parse(data);
        }
        return {};
    }
   function updateDisabledCommands(commandName, disable) {
        let disabledCommands = loadDisabledCommands();

        if (disable) {
            disabledCommands[commandName] = true;
        } else {
            delete disabledCommands[commandName];
        }

        fs.writeFileSync(commandsFilePath, JSON.stringify(disabledCommands, null, 2));
    }
	
	
module.exports = {
    module: AdminCommands,
};
