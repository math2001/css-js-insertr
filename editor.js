"use strict";

class App {

    static init() {
        this.cacheDOM()
        this.bindDOM()
        this.pattern.value = new URLSearchParams(location.search).get('pattern') || ''
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

}


App.init()
