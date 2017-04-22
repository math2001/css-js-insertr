"use strict";

class App {

    static init() {
        this.cacheDOM()
        this.bindDOM()

        this.loadConfigs()
        .then(configs => this.render(configs))
        .catch(error => alert(`Error: ${error}`))

        ConfigManager.getSettings()
        .then(settings => this.fillSettings(settings))
        .catch(error => alert(`Error: ${error}`))
    }

    static cacheDOM() {
        this.configs = document.querySelector('#configs')
        this.add = document.querySelector('#add')
        this.saveSettingBtns = Array.from(document.querySelectorAll('.save-setting-button'))

        this.settings = {
            counter: document.querySelector('#counter'),
            fontSize: document.querySelector('#font-size'),
            tabSize: document.querySelector('#tab-size')
        }
    }

    static bindDOM() {
        this.add.addEventListener('click', _ => {
            chrome.tabs.create({
                url: chrome.runtime.getURL('edit.html')
            })
        })
        this.saveSettingBtns.some((btn) => {
            btn.addEventListener('click', e => {
                this.saveSettingBtns.some((btn) => {
                    btn.disabled = true
                })
                ConfigManager.setSettings(this.getSettingsFromDom()).catch(error => {
                    alert(`Error: ${error}`)
                }).then(_ => {
                    this.saveSettingBtns.some((btn) => {
                        btn.disabled = false
                    })
                })
            })
        })

        Object.values(this.settings).some((domSetting) => {
            domSetting.addEventListener('change', _ => {
                this.saveSettingBtns.some((btn) => {
                    btn.classList.add('primary')
                })
            })
        })

    }

    static getSettingsFromDom() {
        const settings = {}
        for (let settingName in this.settings) {
            if (this.settings[settingName].type === 'checkbox') {
                settings[settingName] = this.settings[settingName].checked
            } else if (this.settings[settingName].type === 'number') {
                settings[settingName] = parseInt(this.settings[settingName].value)
            } else if (this.settings[settingName].type === 'text') {
                settings[settingName] = this.settings[settingName].value
            }
        }
        return settings
    }

    static fillSettings(settings) {
        let domSetting;
        for (let settingName in this.settings) {
            domSetting = this.settings[settingName]
            if (domSetting.type == 'checkbox') {
                domSetting.checked = settings[settingName]
            } else {
                domSetting.value = settings[settingName]
            }
        }
    }

    static loadConfigs() {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage(null, {
                type: 'get-all-configs'
            }, configs => {
                if (typeof configs === 'string') {
                    reject(configs)
                } else if (configs === undefined) {
                    reject("[Internal Error] Configs are undefined on 'get-all-configs'.")
                } else {
                    resolve(configs)
                }
            })
        })
    }

    static render(configs) {
        this.configs.innerHTML = ''
        render(configs, this.configs)
    }

}

App.init()
