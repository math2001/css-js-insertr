"use strict";

class App {

    static init() {
        this.cacheDOM()

        chrome.tabs.query({active: true, currentWindow: true}, tab => {
            this.hostname = new URL(tab[0].url).hostname
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

}

App.init()
