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
    }

    static bindDOM() {
        this.add.addEventListener('click', _ => {
            chrome.tabs.create({
                url: chrome.runtime.getURL('edit.html')
            })
        })
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
