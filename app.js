"use strict";

class ConfigManager {

    // get and set the scripts and styles

    static init() {
        this.storage = chrome.storage.local
        this.keyOfPatternList = '.___patterns___.'
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
        return new Promise((resolve, reject) => {
            this.storage.remove(keys, function () {
                resolve()
            })
        })
    }

    static remove(pattern) {
        // remove the patterns list
        this.getFromStorage(this.keyOfPatternList).then(object => {
            return object[this.keyOfPatternList].filter(item => item !== pattern)
        }).then(patterns => {
            let obj = {}
            obj[this.keyOfPatternList] = patterns
            this.storage.set(obj)
        })
        // remove the config
        this.removeFromStorage(pattern)
    }

}

ConfigManager.init()

chrome.runtime.onMessage.addListener((e, _, sendResponse) => {
    if (e.type === 'get-configs') {
        ConfigManager.getFor(e.url).then(configs => {
            sendResponse(configs)
        })
        return true
    } else if (e.type === 'update-config') {
        ConfigManager.setFor(e.pattern, e.config).then(_ => {
            if (e.pattern !== e.previousPattern) {
                ConfigManager.remove(e.previousPattern)
            }
        })
    }
})
