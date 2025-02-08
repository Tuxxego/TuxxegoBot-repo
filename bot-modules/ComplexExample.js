BotModule = require('../BotModule.js');

class ComplexExample extends BotModule {

    prefix = '-';
    disabled = true;
    disabledMessage = 'This module is disabled as a showcase of how to disable modules.';

    /**
     * Initializes the module.
     * @returns {void}
     */
    init() {
        this.commands.push(this.complexExampleCommand);
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
    async complexExampleCommand(self, message, args) {
        await message.channel.send('Complex example command executed!');
    }
}

module.exports = {
    module: ComplexExample,
    complexStuff: 'This is a complex example of a module that does stuff.'
}