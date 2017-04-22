"use strict";

class Editors {

    // manages the css and js editors

    static init(css, js) {

        this.theme = 'tomorrow'
        this.useVim = true

        ace.require("ace/ext/emmet")

        this.cssEditor = ace.edit(css)
        this.applyConfig(this.cssEditor)
        this.cssEditor.getSession().setMode('ace/mode/css')
        this.cssEditor.setOption("enableEmmet", true)

        this.jsEditor = ace.edit(js)
        this.applyConfig(this.jsEditor)
        this.jsEditor.getSession().setMode('ace/mode/javascript')
    }

    static applyConfig(editor) {
        if (this.useVim === true) {
            editor.setKeyboardHandler('ace/keyboard/vim')
        }
        if (this.theme !== undefined) {
            editor.setTheme(`ace/theme/${this.theme}`)
        }
    }

    static css(value) {
        if (value === undefined) {
            return this.cssEditor.getValue()
        }
        this.cssEditor.setValue(value)
        this.cssEditor.selection.clearSelection()
    }
    static js(value) {
        if (value === undefined) {
            return this.jsEditor.getValue()
        }
        this.jsEditor.setValue(value)
        this.jsEditor.selection.clearSelection()
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
            css: Editors.css(),
            js: Editors.js(),
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
        Editors.css(config.css)
        Editors.js(config.js)
        this.previousPattern = this.pattern.value
    }

    static showError(error) {
        alert(`Error!!\n-------\n${error}`)
    }

}


App.init()
