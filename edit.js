"use strict";

class Editors {

    // manages the css and js editors

    static init(css, js) {

        ConfigManager.getSettings()
        .then(settings => {
            this.settings = settings

            if (settings.emmet === true) {
                ace.require("ace/ext/emmet")
            }

            this.cssEditor = ace.edit(css)
            this.applySettings(this.cssEditor)
            this.cssEditor.getSession().setMode('ace/mode/css')
            if (settings.emmet === true) {
                this.cssEditor.setOption("enableEmmet", true)
            }

            this.jsEditor = ace.edit(js)
            this.applySettings(this.jsEditor)
            this.jsEditor.getSession().setMode('ace/mode/javascript')
        })

    }

    static applySettings(editor) {
        if (this.settings.vimMode === true) {
            editor.setKeyboardHandler('ace/keyboard/vim')
        }
        if (this.settings.theme !== undefined) {
            editor.setTheme(`ace/theme/${this.theme}`)
        }
        editor.getSession().setUseSoftTabs(this.settings.softTabs)
        editor.setHighlightActiveLine(this.settings.highlightLine)
        editor.container.style.fontSize = this.settings.fontSize + 'px'
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

function getCurrentTab() {
    return new Promise(resolve => {

        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            resolve(tabs[0])
        })

    })
}

class App {

    static init() {
        this.cacheDOM()

        const searchParams = new URLSearchParams(location.search)

        this.patternString = searchParams.get('pattern') || ''
        this.pattern.value = this.patternString

        Editors.init(this.css, this.js)

        let loadConfig
        if (searchParams.get('load') === 'true') {
            loadConfig = this.loadConfig().then(this.fillConfig.bind(this))
            this.previousPattern = this.patternString
        } else {
            loadConfig = 1
        }


        Promise.all([getCurrentTab().then(tab => {
            this.tabId = tab.id
            this.bindDOM()
        }), loadConfig]).then(this.enable.bind(this))


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
        if (typeof config === 'string') {
            return this.showError(config)
        }
        Editors.css(config.css)
        Editors.js(config.js)
        this.previousPattern = this.pattern.value
    }

    static showError(error) {
        alert(`Error!!\n-------\n${error}`)
    }

}


App.init()
