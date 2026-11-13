const {ipcMain} = require("electron");
const {ipcMsgModify} = require("./utils/ipcUtils.js");
const path = require("path");
const {Config} = require("./Config.js");
const fs = require("fs");

exports.onLoad = api => {
    const pluginPath = api.plugins.change_summary.path.plugin;
    const configPath = path.join(pluginPath, "config.json");
    const configReady = Config.initConfig(pluginPath, configPath);
    const chatWindows = new Set();

    module.exports.onBrowserWindowCreated = window => {
        window.webContents.on("did-stop-loading", () => {
            const url = window.webContents.getURL();
            if (url.includes("#/main/message") || url.includes("#/chat")) {
                chatWindows.add(window);
            } else {
                chatWindows.delete(window);
            }
        });
        window.webContents.once("destroyed", () => chatWindows.delete(window));
    };

    function isSendMessage(command) {
        return command.name === "nodeIKernelMsgService/sendMsg";
    }

    api.api.intercept.register("change_summary", "outgoing", async context => {
        await configReady;
        for (const command of context.commands) {
            if (isSendMessage(command)) {
                const payload = Array.isArray(command.payload) ? command.payload[0] : command.payload;
                await ipcMsgModify(payload);
            }
        }
    }, {
        filter: context => chatWindows.has(context.window) && context.commands.some(isSendMessage),
    });

    ipcMain.handle("LiteLoader.change_summary.getMenuHTML", () =>
        fs.readFileSync(path.join(pluginPath, "src/pluginMenu.html"), "utf-8"));
    ipcMain.handle("LiteLoader.change_summary.getConfig", () => Config.getConfig());
    ipcMain.handle("LiteLoader.change_summary.setConfig", (event, newConfig) =>
        Config.setConfig(newConfig));
};
