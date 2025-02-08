BotModule = require('../BotModule.js');

class Example extends BotModule {
    prefix = '-';

    /**
     * Initializes the module.
     * @returns {void}
     */
    init() {
        this.disabledCommand.disabled = true;
        this.secretcommand.secret = true;
        this.disabledCommand.disabledMessage = 'This command is disabled in the example module as a showcase of how to disable commands.';
        this.exampleCommand.aliases = ['exampleAlias', 'exampleCommandAlias'];
        this.commands.push(this.exampleCommand);
        this.commands.push(this.secretcommand);
        this.commands.push(this.disabledCommand);
        this.commands.push(this.useThisExample_sinceThisIsUndefinedInCommandsAndListeners);
        this.listeners.push(this.messageCreate);
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
     * An example command. Can be invoked by any user via "-exampleCommand"
     * @param self {BotModule} The module that invoked the command.
     * @param message {ShardEvents.Message} The message that invoked the command.
     * @param args {string[]} Any arguments passed to the command.
     * @return {Promise<void>}
     */
    async exampleCommand(self, message, args) {
        await message.channel.send('Example command executed!');
    }

    async secretcommand(self, message, args) {
        await message.channel.send('This command is secret frfr.');
    }
    /**
     * A command that's marked as disabled in the init() method. Can be invoked by any user via "-disabledCommand"
     * @param self {BotModule} The module that invoked the command.
     * @param message {ShardEvents.Message} The message that invoked the command.
     * @param args {string[]} Any arguments passed to the command.
     * @return {Promise<void>}
     */
    async disabledCommand(self, message, args) {
        await message.channel.send('This command normally does something.');
    }

    /**
     * An example command that uses the bot client. Can be invoked by any user via "-useThisExample_sinceThisIsUndefinedInCommandsAndListeners"
     * @param self {BotModule} The module that invoked the command.
     * @param message {ShardEvents.Message} The message that invoked the command.
     * @param args {string[]} Any arguments passed to the command.
     * @return {Promise<void>}
     */
    async useThisExample_sinceThisIsUndefinedInCommandsAndListeners(self, message, args) {
        await message.channel.send('Test bot command started!');
        let bot = self.bot;
        if (bot) {
            await message.channel.send('Bot found!');
        }
    }

    /**
     * An example listener. Will register to the messageCreate event, therefore trigger when any message is sent in any channel the bot can see.
     * @param self {BotModule} The module that invoked the listener.
     * @param message {ShardEvents.Message} The message that was sent.
     * @return {Promise<void>}
     */
    async messageCreate(self, message) {
        if (message.content === 'example bot module listener') {
            await message.channel.send('Example message listener executed!');
        }
    }
}

module.exports = Example;