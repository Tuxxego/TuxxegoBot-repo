/**
 * @typedef {import('discord.js').Client} Client
 * @typedef {import('discord.js').ShardEvents} ShardEvents
 */
class BotModule {
    /**
     * A reference to the bot client.
     * @type {Client<boolean>} bot
     */
    bot;
    /**
     * The prefix to use for command of this module.
     * @type {string} prefix
     */
    prefix;

    /**
     * Whether a module is disabled.
     * @type {boolean}
     */
    disabled = false;
	
	 /**
     * Whether a module is disabled in Cakes Cave.
     * @type {boolean}
     */
    disabledcc = false;

    /**
     * A message to display when a module is disabled.
     * @type {string | null}
     */
    disabledMessage = null

    /**
     * A list of predicates that need to be fulfilled for a command of the module to be executed.
     * @type {[function(BotModule, ShardEvents.Message): Promise<boolean>]}
     */
    usageRequirements = []

    /**
     * Initializes the module.
     * @returns {void}
     */
    init() {
        throw new Error('Not implemented');
    }

    /**
     * Called when an error occurs in the module.
     * @param error {Error} The error that occured.
     * @returns {boolean} Returns true if the error was handled successfully, false otherwise.
     */
    onError(error) {
        return false;
    }

    /**
     * All commands that are registered to this module.
     * @type {[function(BotModule, ShardEvents.Message, string[]): Promise<void>]}
     */
    commands = [];

    /**
     * All listeners that are registered to this module.
     * @type {[function(BotModule, ...any[]): Promise<void>]}
     */
    listeners = [];
}

module.exports = BotModule;