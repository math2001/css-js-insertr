"use strict";

class App {

    static init() {
        this.cacheDOM()
        this.bindDOM()

        this.loadConfigs()
        .then(configs => this.render(configs))
        .catch(error => alert(`Error: ${error}`))
    }

    static cacheDOM() {
        this.configs = document.querySelector('#configs')
        this.add = document.querySelector('#add')
        this.saveSettingBtns = Array.from(document.querySelectorAll('.save-setting-button'))

        this.settings = {
            sync: document.querySelector('#sync'),
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
                ConfigManager.setSettings(this.getSettings()).catch(error => {
                    alert(`Error: ${error}`)
                }).then(_ => {
                    this.saveSettingBtns.some((btn) => {
                        btn.disabled = false
                    })
                })
            })
        })
    }

    static getSettings() {
        const settings = {}
        for (let settingName in this.settings) {
            if (this.settings[settingName].type === 'checkbox') {
                settings[settingName] = this.settings[settingName].checked
            } else {
                settings[settingName] = this.settings[settingName].checked
            }
        }
        return settings
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
