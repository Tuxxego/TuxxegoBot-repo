
/**
 * Splits a message containing a command into an array of strings based on whitespaces, with quoted contents staying as one string.
 * @param messageContent {string} The content of the message to split.
 * @return {string[]} The split message.
 */
function splitCommandMessage(messageContent) {
    let inQuote = false;
    let escaped = false;
    let result = [];
    let currentString = "";
    for (const character of messageContent) {
        if (escaped) {
            currentString += character;
            escaped = false;
        } else {
            if (character === "\\") {
                escaped = true;
            } else if (character === "\"" || character === "“" || character === "”") {
                inQuote = !inQuote;
            } else if (character === " ") {
                if (!inQuote) {
                    result.push(currentString);
                    currentString = "";
                } else {
                    currentString += character;
                }
            } else {
                currentString += character;
            }
        }
    }
    result.push(currentString);
    return result;
}



/**
 *
 * @type {{[key: Client<boolean>]: BotModule[]}}
 */
const attachedModules = {};

/**
 * Attaches a provided set of modules to a Discord bot client.
 * @param modules {BotModule[]} The modules to attach.
 * @param client {import('discord.js').Client} The client to attach the modules to.
 * @returns {void}
 */
function attachModules(modules, client) {
    attachedModules[client] = [];
    for (const module of modules) {
        module.bot = client;
        module.init();
        
        client.on("messageCreate", async (message) => {
            if (!message.content.startsWith(module.prefix)) {
                return;
            }
            const args = splitCommandMessage(message.content.slice(module.prefix.length).trim());
            const command = args.shift();

            for (const commandFunction of module.commands) {
                if (commandFunction.name === command || (commandFunction.aliases !== undefined && commandFunction.aliases.includes(command))) {
                    let requirementsMet = true;
                    
                    for (const requirement of module.usageRequirements) {
                        if (!await requirement(module, message)) {
                            requirementsMet = false;
                            break;
                        }
                    }

                    if (commandFunction.usageRequirements !== undefined) {
                        for (const requirement of commandFunction.usageRequirements) {
                            if (!await requirement(module, message)) {
                                requirementsMet = false;
                                break;
                            }
                        }
                    }

                    if (!requirementsMet) {
                        return;
                    }

                    if (module.disabled) {
                        if (module.disabledMessage) {
                            await message.reply(module.disabledMessage);
                        } else {
                            await message.reply("This command is disabled.");
                        }
                        return;
                    }
					
                    if (module.disabledcc) {
                        if (module.disabledMessage) {
                            await message.reply(module.disabledMessage);
                        } else {
                            await message.reply("This command is disabled in Cakes Cave.");
                        }
                        return;
                    }
					
                    if (commandFunction.disabled !== undefined && commandFunction.disabled) {
                        if (commandFunction.disabledMessage !== undefined) {
                            await message.reply(commandFunction.disabledMessage);
                        } else {
                            await message.reply("This command is disabled.");
                        }
                        return;
                    }

                    if (commandFunction.disabledcc !== undefined && commandFunction.disabledcc && message.guild.id === "1172542455002959892") {
                        if (commandFunction.disabledMessage !== undefined) {
                            await message.reply(commandFunction.disabledMessage);
                        } else {
                            await message.reply("This command is disabled in Cakes Cave.");
                        }
                        return;
                    }
					
                    try {
                        await commandFunction(module, message, args);
                    } catch (error) {
                        if (!module.onError(error)) {
                            console.error(error);
                        }
                    }
                    return; 
                }
            }


        });
        for (const listener of module.listeners) {
            client.on(listener.name, async (...args) => {
                if (module.disabled) {
                    return;
                }
                try {
                    await listener(module, ...args);
                } catch (error) {
                    if (!module.onError(error)) {
                        console.error(error);
                    }
                }
            });
        }
        attachedModules[client].push(module);
    }
}

/**
 * Disables a command with the given name across all modules.
 * @param {string} name The name of the command to disable.
 */
function disableCommand(name) {
    for (const client in attachedModules) {
        for (const mod of attachedModules[client]) {
            for (const commandFunction of mod.commands) {
                if (commandFunction.name === name || (commandFunction.aliases && commandFunction.aliases.includes(name))) {
                    commandFunction.disabled = true;
                    console.log(`Command "${name}" has been disabled in module "${mod.constructor.name}".`);
                }
            }
        }
    }
}

/**
 * Enables a command with the given name across all modules.
 * @param {string} name The name of the command to enable.
 */
function enableCommand(name) {
    for (const client in attachedModules) {
        for (const mod of attachedModules[client]) {
            for (const commandFunction of mod.commands) {
                if (commandFunction.name === name || (commandFunction.aliases && commandFunction.aliases.includes(name))) {
                    commandFunction.disabled = false;
                    console.log(`Command "${name}" has been enabled in module "${mod.constructor.name}".`);
                }
            }
        }
    }
}

/**
 * Disables a command with the given name across all modules.
 * @param {string} name The name of the command to disable.
 */
function disableCommandCC(name) {
    for (const client in attachedModules) {
        for (const mod of attachedModules[client]) {
            for (const commandFunction of mod.commands) {
                if (commandFunction.name === name || (commandFunction.aliases && commandFunction.aliases.includes(name))) {
                    commandFunction.disabledcc = true;
                    console.log(`Command "${name}" has been disabled in module "${mod.constructor.name}".`);
                }
            }
        }
    }
}

/**
 * Enables a command with the given name across all modules.
 * @param {string} name The name of the command to enable.
 */
function enableCommandCC(name) {
    for (const client in attachedModules) {
        for (const mod of attachedModules[client]) {
            for (const commandFunction of mod.commands) {
                if (commandFunction.name === name || (commandFunction.aliases && commandFunction.aliases.includes(name))) {
                    commandFunction.disabledcc = false;
                    console.log(`Command "${name}" has been enabled in module "${mod.constructor.name}".`);
                }
            }
        }
    }
}

/**
 * Gets a module of a specific type that is attached to a client.
 * @param client {Client<boolean>} The client to get the module from.
 * @param type {BotModule} The type of module to get.
 * @return {null|BotModule} The module if found, null otherwise.
 */
function getModule(client, type) {
    for (const module of attachedModules[client]) {
        if (module instanceof type) {
            return module;
        }
    }
    return null;
}

module.exports = {
    attachModules,
    getModule,
	enableCommand,
	disableCommand,
	enableCommandCC,
	disableCommandCC
};