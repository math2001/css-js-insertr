"use strict";

class App {

    static init() {
        this.cacheDOM()

        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            this.hostname = new URL(tabs[0].url).hostname
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'get-configs'
            }, configs => {
                this.render(configs)
            })
            this.bindDOM()
        })
    }

    static cacheDOM() {
        this.configs = document.querySelector('#configs')
        this.addConfig = document.querySelector('#add-config')
    }

    static bindDOM() {
        this.addConfig.addEventListener('click', _ => {
            chrome.tabs.create({
                url: chrome.runtime.getURL(`edit.html?pattern=${this.hostname}`)
            })
        })
    }

    static render(configs) {
        if (configs === undefined) {
            document.body.classList.add('error')
        } else {
            document.body.classList.remove('error')
            render(configs, this.configs)
        }
    }

}

App.init()
