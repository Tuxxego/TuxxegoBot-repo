const fs = require('node:fs');
const path = require('node:path');
const BotModule = require('./BotModule.js');
const modules = [];
    const justModuleNames = [];

/**
 * Checks if the specified object is a BotModule.
 * @param module {object} The object to check.
 * @return {boolean} Whether the object is a BotModule.
 */
function isBotModule(module) {
    if (module === undefined || module === null) {
        return false;
    }
    let current = module.__proto__;
    while (current !== null) {
        if (current === BotModule) {
            return true;
        }
        current = current.__proto__;
    }
    return false;
}

/**
 * Finds all modules in the specified subdirectory and returns them as instances.
 * @param subdirectory {string} The subdirectory to search for modules in. Defaults to "bot-modules".
 * @return {BotModule[]} A list of instances of all modules found in the directory.
 */
function loadModules(subdirectory = 'bot-modules') {
    const foldersPath = path.join(__dirname, subdirectory);
    const commandFolders = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

    /**
     * Instances of the found modules.
     * @type {BotModule[]}
     */
    for (const module of commandFolders) {
        const moduleFilePath = path.join(foldersPath, module);
        let Module = require(moduleFilePath);
        if (isBotModule(Module)) {
            modules.push(new Module());
        } else {
            Module = require(moduleFilePath).module;
            if (isBotModule(Module)) {
                modules.push(new Module());
            } else {
                console.error(`Module ${module} does not extend BotModule on any standard export path and will be ignored.`);
            }
        }
    }
    return modules;
}

/**
 * Lists all modules attached to a Discord client.
 * @return {BotModule[]} The list of loaded modules.
 */
function listAllModules() {
    if (modules.length > 0) {
        return modules;
    }
    return []; 
}

/**
 * Creates a list of module names.
 * @return {string[]} A list of module names.
 */
function getJustModuleNames() {
    const allModules = listAllModules(); 

    allModules.forEach(module => {
        justModuleNames.push(module.constructor.name); 
    });

    return justModuleNames;
}

module.exports = {
    loadModules,
    listAllModules,
    getJustModuleNames,
    justModuleNames,
    modules
};
