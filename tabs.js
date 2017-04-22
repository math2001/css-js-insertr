"use strict";

class Tabs {

    constructor(container) {

        this.container = container

        this.cacheDOM()
        this.bindDOM()

    }

    cacheDOM() {
        this.tabs = this.container.querySelector('.tabs')
        this.underline = this.tabs.querySelector('.underline')
        this.tabsContent = this.container.querySelector('.tabs-content')

        this.currentTab = this.container.querySelector('.tab.active')
        this.currentTabContent = this.container.querySelector('.tab-content.active')
    }

    moveUnderlineTo(element) {
        this.underline.style.width = element.clientWidth + 'px'
        this.underline.style.left = element.offsetLeft + 'px'
    }

    bindDOM() {
        this.tabs.addEventListener('click', e => {
            const tabName = e.target.getAttribute('data-tab')
            if (tabName === null) {
                return
            }
            const tabContent = this.tabsContent.querySelector(`#tab-${tabName}`)
            if (tabContent === null) {
                throw new Error(`Couldn't find tab with the for '${tabName}'`)
            }
            this.currentTab.classList.remove('active')
            e.target.classList.add('active')
            this.currentTab = e.target
            this.moveUnderlineTo(this.currentTab)

            this.currentTabContent.classList.remove('active')
            tabContent.classList.add('active')
            this.currentTabContent = tabContent
        })
    }

}

new Tabs(document.querySelector('.container'))
