"use strict";

function Badge(text) {

    const badge = document.createElement('span')
    badge.classList.add('badge')
    badge.textContent = text
    return badge

}

class App {

    static init() {
        this.cacheDOM()

        this.loadConfigs()
        .then(configs => this.render(configs))
        .catch(error => alert(`Error: ${error}`))
    }

    static cacheDOM() {
        this.configs = document.querySelector('#configs')
    }

    static loadConfigs() {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage(null, {
                type: 'get-all-configs'
            }, configs => {
                if (typeof configs === 'string') {
                    reject(configs)
                } else if (configs === undefined) {
                    reject("[Internal Error] Configs are undefined on 'get-all-configs'.")
                } else {
                    resolve(configs)
                }
            })
        })
    }

    static render(configs) {
        this.configs.innerHTML = ''
        let li, a, badges;
        for (let pattern in configs) {
            li = document.createElement('li')
            li.classList.add('config')
            a = document.createElement('a')
            a.href = chrome.runtime.getURL(`/edit.html?load=true&pattern=${pattern}`)
            a.target = '_blank'
            a.textContent = pattern
            badges = document.createElement('span')
            badges.classList.add('badges')
            if (configs[pattern].css !== '') {
                badges.appendChild(Badge('CSS'))
            }
            if (configs[pattern].js !== '') {
                badges.appendChild(Badge('JavaScript'))
            }
            a.appendChild(badges)
            li.appendChild(a)
            this.configs.appendChild(li)
        }
    }

}

App.init()
