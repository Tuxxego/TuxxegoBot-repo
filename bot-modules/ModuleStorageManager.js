const fs = require('fs');
const path = require('path');

let baseDir;

function setBaseDir(directory = 'bot-modules-storage') {
    const parentDir = path.resolve(__dirname, '..');
    baseDir = path.join(parentDir, directory);
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }
}

class ModuleStorageManager {
    constructor(directory = 'bot-modules-storage') {
        setBaseDir(directory);
    }
}

function getModuleDir(moduleName) {
    if (!baseDir || typeof baseDir !== 'string') {
        throw new Error("baseDir is not defined or not a valid string.");
    }

    const moduleDir = path.join(baseDir, moduleName);
 //   console.log(`Base Directory: ${baseDir}`);
 //   console.log(`Module Directory: ${moduleDir}`);

    if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir);
    }
    return moduleDir;
}

/**
 * Save data to a file within a module's directory.
 * @param {BotModule} module - The module requesting the storage.
 * @param {string} fileName - The name of the file to save.
 * @param {string|Buffer|Uint8Array} data - The data to save.
 */
function saveFile(module, fileName, data) {
    const moduleDir = getModuleDir(module.name);
    const filePath = path.join(moduleDir, fileName);
    fs.writeFileSync(filePath, data);
}

/**
 * Load data from a file within a module's directory.
 * @param {BotModule} module - The module requesting the storage.
 * @param {string} fileName - The name of the file to load.
 * @returns {string|Buffer} The loaded data.
 */
function loadFile(module, fileName) {
    const moduleDir = getModuleDir(module.name);
    if (!moduleDir) {
        throw new Error(`Module directory not found for ${module.name}.`);
    }

    if (typeof fileName !== 'string') {
        throw new Error("fileName is not defined or not a string.");
    }

    const filePath = path.join(moduleDir, fileName);
    //console.log(`Loading File Path: ${filePath}`);

    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
    } else {
        throw new Error(`File ${fileName} does not exist in module ${module.name}'s storage.`);
    }
}

/**
 * Delete a file within a module's directory.
 * @param {BotModule} module - The module requesting the storage.
 * @param {string} fileName - The name of the file to delete.
 */
function deleteFile(module, fileName) {
    const moduleDir = getModuleDir(module.name);
    const filePath = path.join(moduleDir, fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    } else {
        throw new Error(`File ${fileName} does not exist in module ${module.name}'s storage.`);
    }
}

/**
 * List all files in a module's directory.
 * @param {BotModule} module - The module requesting the storage.
 * @returns {string[]} List of file names.
 */
function listFiles(module) {
    const moduleDir = getModuleDir(module.name);
    return fs.readdirSync(moduleDir);
}

module.exports = {
    ModuleStorageManager,
    listFiles,
    deleteFile,
    loadFile,
    saveFile,
    getModuleDir,
    setBaseDir
};
