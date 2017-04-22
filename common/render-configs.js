"use strict";

function Badge(text) {

    const badge = document.createElement('span')
    badge.classList.add('badge')
    badge.textContent = text
    return badge

}

function render(configs, element) {
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
        element.appendChild(li)
    }
}
