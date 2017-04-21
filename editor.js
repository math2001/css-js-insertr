"use strict";

class App {

    static init() {
        this.cacheDOM()
        this.bindDOM()
        const searchParams = new URLSearchParams(location.search)
        this.patternString = searchParams.get('pattern') || ''
        if (searchParams.get('load') === 'true') {
            this.fillConfig().then(_ => this.enable())
        } else {
            this.enable()
        }
        this.pattern.value = this.patternString
    }

    static cacheDOM() {
        this.pattern = document.querySelector('#pattern')
        this.css = document.querySelector('#css')
        this.js = document.querySelector('#js')
        this.save = document.querySelector('#save')
        this.previousPattern = this.pattern.value
    }

    static bindDOM() {

        this.save.addEventListener('click', e => {
            chrome.runtime.sendMessage(null, {
                type: 'update-config',
                config: this.getConfig(),
                previousPattern: this.previousPattern,
                pattern: this.pattern.value
            }, response => {
                this.previousPattern = this.pattern.value
            })
        })

    }

    static getConfig() {
        return {
            css: this.css.value,
            js: this.js.value,
        }
    }

    static enable() {
        document.body.classList.remove('loading')
    }

    static loadConfig() {
        return new Promise(resolve => {
            chrome.runtime.sendMessage(null, {
                type: 'get-config',
                pattern: this.patternString
            }, config => {
                resolve(config)
            })
        })

    }

    static fillConfig() {
        return this.loadConfig().then(config => {
            debugger
            this.css.value = config.css
            this.js.value = config.js
        })
    }

}


App.init()
