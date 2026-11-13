const {Config} = require("../Config.js");
const {pluginLog} = require("./backendLogUtils.js");

const config = Config.config;

async function getSummary(isMeme) {
    const outsideText = isMeme ? config.memeOutsideText : config.picOutsideText;
    const useRandom = isMeme ? config.isMemeOTuseRandom : config.isPicOTuseRandom;
    if (!useRandom) return outsideText;

    const response = await fetch(config.randomTextApi);
    const json = await response.json();
    if (!response.ok || !Object.hasOwn(json, config.randomTextApiKey)) return outsideText;
    return json[config.randomTextApiKey] || outsideText;
}

async function ipcMsgModify(payload) {
    for (const item of payload.msgElements) {
        if (item.elementType === 2) {
            pluginLog("尝试修改图片外显");
            item.picElement.summary = await getSummary(item.picElement.picSubType === 1);
        } else if (item.elementType === 11) {
            pluginLog("尝试修改商城表情外显");
            item.marketFaceElement.faceName = await getSummary(true);
        }
    }
}

module.exports = {ipcMsgModify};
