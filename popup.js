"use strict";

class App {

    static init() {
        this.cacheDOM()

        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            this.hostname = new URL(tabs[0].url).hostname
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'get-configs-pattern'
            }, patterns => {
                this.updatePatterns(patterns)
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

    static updatePatterns(patterns) {
        patterns.some((pattern) => {
            const li = document.createElement('li')
            const a = document.createElement('a')
            a.href = chrome.runtime.getURL(`/edit.html?pattern=${pattern}&load=true`)
            a.target = '_blank'
            a.textContent = pattern
            li.appendChild(a)
            this.configs.appendChild(li)
        })
    }

}

App.init()
