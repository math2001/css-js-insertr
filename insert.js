"use strict";

class Insertr {

    static init() {
        chrome.runtime.sendMessage(null, {
            type: 'get-configs',
            url: location.href
        }, configs => {
            this.applyConfigs(configs)
            this.updatePopup(configs)
        })
    }

    static applyConfigs(configs) {
        for (let configPattern in configs) {
            this.apply(configPattern, configs[configPattern])
        }
    }

    static apply(pattern, config) {
        const style = document.createElement('style')
        style.type = 'text/css'
        style.rel = 'stylesheet'
        style.innerHTML = config.css
        style.setAttribute('__data-pattern', pattern)
        document.head.appendChild(style)

        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.innerHTML = config.js
        script.setAttribute('__data-pattern', pattern)
        document.body.appendChild(script)
    }

    static updatePopup() {
        // does nothing for now
    }

}

Insertr.init()
