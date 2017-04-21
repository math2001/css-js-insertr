"use strict";

class App {

    static init() {
        this.cacheDOM()
        this.bindDOM()
    }

    static cacheDOM() {
        this.pattern = document.querySelector('#pattern')
        this.css = document.querySelector('#css')
        this.js = document.querySelector('#js')
        this.save = document.querySelector('#save')
    }

    static bindDOM() {

        this.save.addEventListener('click', e => {
            chrome.runtime.sendMessage({
                name: 'update-config',
                config: this.getConfig()
            })
        })

    }

    static getConfig() {
        return {
            pattern: this.pattern.value,
            css: this.css.value,
            js: this.js.value,
        }
    }

}


App.init()
