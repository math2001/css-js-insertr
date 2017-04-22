"use strict";

class Tabs {

    constructor(container) {

        this.container = container

        this.cacheDOM()
        this.showTabFromHash()
        this.bindDOM()

    }

    cacheDOM() {
        this.tabs = this.container.querySelector('.tabs')
        this.underline = this.tabs.querySelector('.underline')
        this.tabsContent = this.container.querySelector('.tabs-content')

        this.currentTab = this.container.querySelector('.tab.active')
        this.currentTabContent = this.container.querySelector('.tab-content.active')
        this.moveUnderlineTo(this.currentTab)
    }

    moveUnderlineTo(element) {
        this.underline.style.width = element.clientWidth + 'px'
        this.underline.style.left = element.offsetLeft + 'px'
    }

    showTabFromHash() {
        const tabName = new URLSearchParams(location.hash.slice(1)).get('tab')
        if (tabName === null) {
            return
        }

        const tab = this.tabs.querySelector(`.tab[data-tab=${tabName}]`)
        if (tab === null) {
            throw new Error(`Couldn't find tab for ${tabName}`)
        }
        const tabContent = this.tabsContent.querySelector(`#tab-${tabName}`)
        if (tabContent === null) {
            throw new Error(`Couldn't find tab content for '${tabName}'`)
        }
        this.currentTab.classList.remove('active')
        tab.classList.add('active')
        this.currentTab = tab
        this.moveUnderlineTo(this.currentTab)

        this.currentTabContent.classList.remove('active')
        tabContent.classList.add('active')
        this.currentTabContent = tabContent
    }

    bindDOM() {
        window.addEventListener('hashchange', this.showTabFromHash.bind(this))

        this.tabs.addEventListener('click', e => {
            const tabName = e.target.getAttribute('data-tab')
            if (tabName === null) {
                return
            }
            let hash = new URLSearchParams(location.hash.slice(1))
            hash.set('tab', tabName)
            location.hash = hash.toString()
        })
    }

}

new Tabs(document.querySelector('.container'))
