"use strict";

class App {

    static init() {
        this.cacheDOM()

        this.loadConfigs()
        .then(configs => this.render(configs))
        .catch(error => alert(`Error: ${error}`))
    }

    static cacheDOM() {
        this.configs = document.querySelector('#configs')
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
