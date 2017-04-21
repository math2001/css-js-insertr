"use strict";

class Editors {

    // manages the css and js editors

    static init(css, js) {

        this.theme = 'ace/theme/monokai'

        this.cssEditor = ace.edit(css)
        this.cssEditor.setTheme(this.theme);
        this.cssEditor.getSession().setMode('ace/mode/css')

        this.jsEditor = ace.edit(js)
        this.jsEditor.setTheme(this.theme)
        this.cssEditor.getSession().setMode('ace/mode/javascript')
    }

}

class App {

    static init() {
        this.cacheDOM()

        Editors.init(this.css, this.js)

        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            this.tabId = tabs[0].id
            this.bindDOM()
        })

        const searchParams = new URLSearchParams(location.search)
        this.patternString = searchParams.get('pattern') || ''
        if (searchParams.get('load') === 'true') {
            this.loadConfig().then(this.fillConfig.bind(this)).then(this.enable.bind(this))
        } else {
            this.enable()
            this.previousPattern = this.pattern.value
        }
        this.pattern.value = this.patternString

    }

    static cacheDOM() {
        this.pattern = document.querySelector('#pattern')
        this.css = document.querySelector('#css')
        this.js = document.querySelector('#js')
        this.save = document.querySelector('#save')
        this.delete = document.querySelector('#delete')
    }

    static bindDOM() {

        this.save.addEventListener('click', _ => {
            chrome.runtime.sendMessage(null, {
                type: 'update-config',
                config: this.getConfig(),
                previousPattern: this.previousPattern,
                pattern: this.pattern.value
            }, response => {
                if (response === 'ok') {
                    this.previousPattern = this.pattern.value
                } else {
                    this.showError(response)
                }
            })
        })

        this.delete.addEventListener('click', _ => {
            chrome.runtime.sendMessage(null, {
                type: 'delete-config',
                pattern: this.previousPattern
            }, response => {
                if (response === 'ok') {
                    chrome.tabs.remove(this.tabId)
                } else {
                    this.showError(response)
                }
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

    static fillConfig(config) {
        this.css.value = config.css
        this.js.value = config.js
        this.previousPattern = this.pattern.value
    }

    static showError(error) {
        alert(`Error!!\n-------\n${error}`)
    }

}


App.init()
