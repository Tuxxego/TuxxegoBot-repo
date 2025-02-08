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
