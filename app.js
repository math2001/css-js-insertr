"use strict";

class ConfigManager {

    // get and set the scripts and styles

    static init() {
        this.storage = chrome.storage.sync
        this.keyOfPatternList = '.___patterns___.'
        this.keyOfSettings = '.___settings___.'

        this.defaultSettings = {
            counter: true,
            fontSize: 16,
            tabSize: 4,
            vimMode: false,
            emmet: true,
            softTabs: true,
            highlightLine: true
        }
    }

    static getSettings() {
        return new Promise((resolve, reject) => {
            this.storage.get(this.keyOfSettings, (object) => {
                if (chrome.runtime.lastError !== undefined) {
                    reject(chrome.runtime.lastError)
                } else {
                    resolve(Object.assign(this.defaultSettings, object[this.keyOfSettings]))
                }
            })
        })
    }

    static setSettings(settings) {
        return new Promise((resolve, reject) => {
            const obj = {}
            obj[this.keyOfSettings] = settings
            this.storage.set(obj, function () {
                if (chrome.runtime.lastError !== undefined) {
                    reject(chrome.runtime.lastError)
                } else {
                    resolve()
                }
            })
        })
    }


    static matches(pattern, url) {
        return new RegExp(pattern).test(url)
    }

    static getFromStorage(keys) {
        return new Promise((resolve, reject) => {
            this.storage.get(keys, obj => {
                resolve(obj)
            })
        })
    }

    static getFor(url) {
        // return a list of configurations
        return this.getFromStorage(this.keyOfPatternList)
            .then(object => {
                const patterns = object[this.keyOfPatternList]
                const matches = []

                if (patterns === undefined) {
                    return []
                }

                patterns.some((pattern) => {
                    if (this.matches(pattern, url)) {
                        matches.push(pattern)
                    }
                })
                return matches
            }).then(matches => {
                const promises = []
                matches.some((pattern) => {
                    promises.push(this.getFromStorage(pattern))
                })
                return Promise.all(promises)
            }).then(configs => {
                const cleanConfigs = {}
                configs.map(config => {
                    const key = Object.keys(config)[0]
                    cleanConfigs[key] = config[key]
                })
                return cleanConfigs
            })
    }

    static setFor(pattern, config) {

        return new Promise((resolve, reject) => {
            this.getFromStorage(this.keyOfPatternList).then((object) => {
                let urls;
                if (object[this.keyOfPatternList] === undefined) {
                    urls = []
                } else {
                    urls = object[this.keyOfPatternList]
                }
                if (urls.indexOf(pattern) === -1) {
                    urls.push(pattern)
                    let obj = {}
                    obj[this.keyOfPatternList] = urls
                    this.storage.set(obj)
                }
                let obj = {}
                obj[pattern] = config
                this.storage.set(obj, () => {
                    resolve()
                })
            })
        })
    }

    static clearStorage() {
        return this.storage.clear(function () {
            console.info('Cleared storage successfully')
        })
    }

    static removeFromStorage(keys) {
        if (keys === undefined) {
            throw new Error('Key are null → should be string or array of string')
        }
        return new Promise((resolve, reject) => {
            this.storage.remove(keys, function () {
                resolve()
            })
        })
    }

    static remove(pattern) {
        // remove the pattern from list
        return this.getFromStorage(this.keyOfPatternList).then(object => {
            return object[this.keyOfPatternList].filter(item => item !== pattern)
        }).then(patterns => {
            let obj = {}
            obj[this.keyOfPatternList] = patterns
            this.storage.set(obj)

            // remove the config
            return this.removeFromStorage(pattern)
        })
    }

}

ConfigManager.init()

chrome.runtime.onMessage.addListener((e, sender, reply) => {
    if (e.type === 'get-configs') {
        ConfigManager.getFor(e.url).then(configs => {
            reply(configs)
            ConfigManager.getSettings().then(settings => {
                if (settings.counter !== true) {
                    return
                }
                chrome.browserAction.setBadgeText({
                    text: Object.keys(configs).length + '',
                    tabId: sender.tab.id
                })
            })
        })
        return true
    }

    else if (e.type === 'update-config') {
        ConfigManager.setFor(e.pattern, e.config).then(_ => {
            if (e.pattern !== e.previousPattern && e.previousPattern !== undefined) {
                ConfigManager.remove(e.previousPattern).then(_ => {
                    reply('ok')
                })
            } else {
                reply('ok')
            }
        })
        return true
    }

    else if (e.type == 'get-config') {
        if (e.pattern === undefined) {
            reply("Internal error: pattern is undefined on 'get-config'")
            return
        }
        ConfigManager.getFromStorage(e.pattern).then(config => {
            reply(config[e.pattern])
        }).catch(error => {
            reply(error)
        })
        return true
    }

    else if (e.type == 'delete-config') {
        ConfigManager.remove(e.pattern).then(_ => {
            reply('ok')
        }).catch(error => {
            reply(error)
        })
        return true
    }

    else if (e.type == 'get-all-configs') {

        ConfigManager.getFromStorage(null).then(configs => {
            delete configs[ConfigManager.keyOfPatternList]
            delete configs[ConfigManager.keyOfSettings]
            reply(configs)
        })
        return true

    }
})
