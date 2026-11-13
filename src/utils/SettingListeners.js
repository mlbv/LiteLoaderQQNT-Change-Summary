import {pluginLog} from "./frontendLogUtils.js";

const csAPI = window.change_summary

export class SettingListeners {
    constructor(doc, api) {//传入一个document对象
        this.document = doc
        this.api = api
    }

    async initListener() {
        const api = this.api;
        let picValue, memeValue, isPicOTuseRandom, isMemeOTuseRandom, rmApiValue, rmApiKeyValue;

        const config = await csAPI.getConfig()
        isPicOTuseRandom = config.isPicOTuseRandom;
        isMemeOTuseRandom = config.isMemeOTuseRandom;

        const picInputEl = this.document.querySelector('#cs-input-pic')
        const memeInputEl = this.document.querySelector('#cs-input-meme')
        picInputEl.value = config.picOutsideText
        memeInputEl.value = config.memeOutsideText

        // 随机外显开关部分
        const picRandomSw = this.document.querySelector('#cs-switch-pic');
        const memeRandomSw = this.document.querySelector('#cs-switch-meme');
        config.isPicOTuseRandom && picRandomSw.toggleAttribute('is-active');
        config.isMemeOTuseRandom && memeRandomSw.toggleAttribute('is-active');

        // 自定义随机文本API部分
        const rmApiInputEle = this.document.querySelector('#cs-input-rmapi');
        const rmApiKeyInputEle = this.document.querySelector('#cs-input-rmapi-key');
        const rmApiFallbackInput = this.document.querySelector('#cs-input-rmapi-fallback');
        rmApiInputEle.value = config.randomTextApi;
        rmApiKeyInputEle.value = config.randomTextApiKey;
        rmApiFallbackInput.value = config.randomTextApiFailedFallbackText;
        // 随机外显API输入框调整，如果开启随机，那么输入框应该是可输入的
        if(config.isPicOTuseRandom || config.isMemeOTuseRandom)
            rmApiKeyInputEle.disabled = rmApiInputEle.disabled = rmApiFallbackInput.disabled = false;

        //设置监听器
        picInputEl.addEventListener('change', async event => {
            picValue = event.target.value

            // 发送设置密钥事件
            await csAPI.setConfig({picOutsideText: picValue})
            pluginLog('修改图片外显为' + picValue)
        })

        memeInputEl.addEventListener('change', async event => {
            memeValue = event.target.value

            // 发送设置密钥事件
            await csAPI.setConfig({memeOutsideText: memeValue})
            pluginLog('修改表情包外显为' + memeValue)
        })

        picRandomSw.addEventListener('click', async function (event) {
            isPicOTuseRandom = !isPicOTuseRandom;
            this.toggleAttribute('is-active');

            // 如果使用随机外显，则禁用自定义外显输入框并启用随机外显API输入框
            if (isPicOTuseRandom) {
                picInputEl.disabled = true;
                rmApiInputEle.disabled = rmApiKeyInputEle.disabled = rmApiFallbackInput.disabled = false;
            } else if (isMemeOTuseRandom) {
                picInputEl.disabled = false; // 如果表情包还在用随机外显，则不禁用自定义外显API输入框
            } else {
                picInputEl.disabled = false;
                rmApiInputEle.disabled = rmApiKeyInputEle.disabled = rmApiFallbackInput.disabled = true;
            }

            // 发送设置密钥事件
            await csAPI.setConfig({isPicOTuseRandom: isPicOTuseRandom})
            pluginLog(`修改图片外显随机开关为 ${isPicOTuseRandom}`)
        })

        memeRandomSw.addEventListener('click', async function (event) {
            isMemeOTuseRandom = !isMemeOTuseRandom;
            this.toggleAttribute('is-active');

            // 如果使用随机外显，则禁用自定义外显输入框并启用随机外显API输入框
            if (isMemeOTuseRandom) {
                memeInputEl.disabled = true;
                rmApiInputEle.disabled = rmApiKeyInputEle.disabled = rmApiFallbackInput.disabled = false;
            } else if (isPicOTuseRandom) {
                memeInputEl.disabled = false; // 如果图片还在用随机外显，则不禁用自定义外显API输入框
            } else {
                memeInputEl.disabled = false;
                rmApiInputEle.disabled = rmApiKeyInputEle.disabled = rmApiFallbackInput.disabled = true;
            }

            // 发送设置密钥事件
            await csAPI.setConfig({isMemeOTuseRandom: isMemeOTuseRandom})
            pluginLog(`修改表情包外显随机开关为 ${isMemeOTuseRandom}`)
        })

        rmApiInputEle.addEventListener('change', async event => {
            rmApiValue = event.target.value || csAPI.getConfig().randomTextApi

            // 发送设置密钥事件
            await csAPI.setConfig({randomTextApi: rmApiValue})
            pluginLog(`修改随机文本API为 ${rmApiValue}`)
        })

        rmApiKeyInputEle.addEventListener('change', async event => {
            rmApiKeyValue = event.target.value || csAPI.getConfig().randomTextApiKey

            // 发送设置密钥事件
            await csAPI.setConfig({randomTextApiKey: rmApiKeyValue})
            pluginLog(`修改随机文本API获取键值为 ${rmApiKeyValue}`)
        })

        rmApiFallbackInput.addEventListener('change', async event => {
            const fallbackValue = event.target.value || "";
            await csAPI.setConfig({randomTextApiFailedFallbackText: fallbackValue});
            pluginLog(`修改随机文本API失败回退文本为 ${fallbackValue}`);
        });

        const manifest = api.plugins.change_summary.manifest;
        this.document.querySelector('#cs-gh-btn')
            .addEventListener('click', () => api.api.openExternal(
                `https://github.com/${manifest.repository.repo}`
            ));

        const versionLabel = this.document.querySelector('#cs-version');
        versionLabel.textContent = `当前版本 v${manifest.version}`;
        const updateButton = this.document.querySelector('#cs-check-update');
        let releaseUrl;
        updateButton.addEventListener('click', async () => {
            if (releaseUrl) {
                api.api.openExternal(releaseUrl);
                return;
            }
            const req = await fetch(
                `https://api.github.com/repos/${manifest.repository.repo}/releases/latest`
            );
            if (!req.ok) {
                updateButton.textContent = req.status === 404 ? '暂无发行版' : '检查失败';
                return;
            }
            const res = await req.json();
            const current = manifest.version.split('.').map(Number);
            const latest = res.tag_name.replace(/^v/, '').split('.').map(Number);
            const difference = latest.findIndex((part, index) => part !== current[index]);
            if (difference !== -1 && latest[difference] > current[difference]) {
                versionLabel.textContent = `当前版本 v${manifest.version} 发现新版本 ${res.tag_name}`;
                updateButton.textContent = '立即更新';
                releaseUrl = res.html_url;
            } else {
                updateButton.textContent = '暂未发现';
            }
        });
    }

    onLoad() {
        this.initListener()
    }
}
