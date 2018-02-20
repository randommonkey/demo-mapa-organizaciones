import './index.css'
import { toggleClass } from './modules/utils'
import { initializeNetwork, update } from './modules/network/network'
import { manageTabs, addCloseEvent, filterNetworkEvent, showTimeline } from './modules/events'
import helpers from './helpers/equals'
import map from './modules/map/map'
import networkTemplate from './templates/network.hbs'
import { requestSheet } from './modules/request'
import { uniq } from 'lodash'

const tabsLinks = Array.from(document.querySelectorAll('.nav-anchor'))
const causesContent = document.getElementById('causes')

tabsLinks.forEach(tabLink => tabLink.addEventListener('click', (event) => {
  const id = manageTabs(event)
  if (id == 'causes') {
    requestSheet((data, tabletop) => {
      const causes = tabletop.sheets('causas').all().filter(cause => cause.visible == '1')
      document.getElementById(id).innerHTML = networkTemplate({ causes })
      addCloseEvent()
      initializeNetwork('svg#network')
      update()
      filterNetworkEvent(update, true)
    })
  }
  if (id == 'timeline') {
    requestSheet((data, tabletop) => {
      const timelineSheet = tabletop.sheets('timeline').all()
      const causes = uniq(timelineSheet.map(row => row.uid_org.trim())).map(cause => ({ label: cause.replace(/-/gi, ' ') }))
  
      const timeline = causes.reduce((arr, cause) => {
        const label = cause.label.replace(/\s/gi, '-')
        arr[cause.label] = []
        
        timelineSheet.forEach(row => {
          if (row.uid_org.includes(label)) {
            const data = { year: row.evento_fecha, description: row.des, image: row.image, caption: row.caption }
            arr[cause.label].push(data)
          }
        })
        return arr
      }, [])

      console.log(timeline)
      showTimeline(causes, timeline, 'afro', false)
    })
  }
}))

window.addEventListener('load', () => {
  addCloseEvent()
})