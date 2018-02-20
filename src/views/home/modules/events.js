import { removeClass, addClass, handleOverlayState, containsClass, removeAllClasses } from './utils'
import organizationsTemplate from '../templates/organizations.hbs'
import organizationTemplate from '../templates/organization.hbs'
import timelineTemplate from '../templates/timeline.hbs'

function addCloseEvent () {
  const overlay = document.querySelector('.overlay')
  const close = Array.from(document.querySelectorAll('.close'))
  prevent()
  close.forEach(button => {
    button.addEventListener('click', () => {
      const network = document.getElementById('network')
      const timeline = document.getElementById('timeline')
      if (network) network.innerHTML = '<p>Espera un momento...</p>'
      if (timeline) timeline.innerHTML = '<p>Espera un momento...</p>'
      removeClass(overlay, 'overlay-opened')
      removeClass(document.querySelector('.anchor-active'), 'anchor-active')
      addClass(document.querySelector('.main-nav-anchor'), 'anchor-active')
      clearAboutContent()
    })
  })
}

function addBackEvent (event, department) {
  const back = document.querySelector('.back')
  back.addEventListener('click', (event) => {
    event.preventDefault()
    showTerritoryContent(event, department)
  })
}

function showTerritoryContent (event, department) {
  addClass(document.querySelector('.overlay'), 'overlay-partial')
  const territoryContentArea = document.getElementById('territories')
  territoryContentArea.innerHTML = organizationsTemplate(department)
  const organizationProfileAnchors = Array.from(document.querySelectorAll('.organization-profile-anchor'))
  organizationProfileAnchors.forEach(anchor => anchor.addEventListener('click', function (event) {
    showOrganizationInfo(event, department)
  }))
  addCloseEvent()
}

function showOrganizationInfo (event, department) {
  event.preventDefault()
  const territoryContentArea = document.getElementById('territories')
  const organization = event.target.dataset.organization
  const organizationInfo = department.organizations.filter(({ uid }) => uid === organization)[0]
  territoryContentArea.innerHTML = organizationTemplate(organizationInfo)
  const sections = Array.from(document.querySelectorAll('.organization-section-anchor'))
  sections.forEach(section => section.addEventListener('click', showOrganizationSection))
  addBackEvent(event, department)
}

function showOrganizationSection (event) {
  event.preventDefault()
  const section = event.target.dataset.section
  const sectionInfo = document.getElementById(section)
  const sections = Array.from(document.querySelectorAll('.info-section'))
  const anchors = Array.from(document.querySelectorAll('.organization-section-anchor'))
  sections.forEach(section => addClass(section, 'hidden'))
  anchors.forEach(anchor => removeClass(anchor, 'active'))
  removeClass(sectionInfo, 'hidden')
  addClass(event.target, 'active')
}

function manageTabs (event) {
  event.preventDefault()
  const overlay = document.querySelector('.overlay')
  const tab = event.target
  const isActive = containsClass(tab, 'anchor-active')
  if (isActive) return
  removeAllClasses(document.querySelectorAll('.anchor-active'), 'anchor-active')
  addClass(tab, 'anchor-active')
  const data = tab.dataset.tab
  if (data !== 'territories') {
    removeClass(overlay, 'overlay-partial')
  } else {
    if (!containsClass(overlay, 'overlay-partial')) addClass(overlay, 'overlay-partial')
  }
  const container = document.getElementById(data)
  const id = handleOverlayState(container)
  return id
}

function setTooltip (node, tooltip, d3) {
	tooltip.html('<span>' + node.name + '</span>')
	tooltip
		.style('top', d3.event.pageY + 'px')
		.style('left', d3.event.pageX + 'px')
		.classed('show', true)
}

function clearTooltip (node, tooltip) {
	tooltip
		.html('')
		.style('top', null)
		.style('left', null)
		.classed('show', false)
}

function setAboutContent (node, group) {
  let title
  if (group == 'cause') {
    title = 'Causa'
  } else if (group == 'organization') {
    title = 'Organización'
  }
  const overlay = document.querySelector('.overlay')
  const about = document.querySelector('.about')
  about.classList.add('show')
  const template = `
    <small>${title}</small>
    <span>${node.name}</span>
    <p class="about-text">${node.description ? node.description : ''}</p>
    ${group == "organization" ? "<a href='${node.uid}'>Ver más</a>" : ''}`

  about.innerHTML = template
  if (overlay.scrollHeight > overlay.offsetHeight) {
    overlay.scrollTo(0, overlay.scrollHeight)
  }
}

function clearAboutContent () {
  const about = document.querySelector('.about')
  if (about) {
    about.classList.remove('show')
    about.innerHTML = ''
  }
}

function filterNetworkEvent (cb, firstRender) {
  const filter = Array.from(document.querySelectorAll('.filter'))
  const filterBox = document.querySelector('.causes-list')
  let fr = firstRender
  filter.forEach(f => {
    f.addEventListener('click', event => {
      event.preventDefault()
      clearAboutContent()
      const group = event.target.dataset.filter
      if (fr) {
        filterBox.classList.add('hidden')
        fr = !fr
      }
      cb(group)
    })
  })
}

function showTimeline (causes, timeline, evt, flag) {
  const container = document.getElementById('timeline')
  container.innerHTML = timelineTemplate({ causes, events: timeline[evt], title: evt.toUpperCase() })
  const overlayNav = document.querySelector('.overlay-nav')
  if (flag) {
    addClass(overlayNav, 'fixed')
    const timelineCauses = document.querySelector('.timeline-causes')
    addClass(timelineCauses, 'hidden')
    removeClass(document.querySelector('.timeline-title'), 'hidden')
  }
  addCloseEvent()
  filterTimelineEvent(causes, timeline)
}

function filterTimelineEvent (causes, timeline, firstRender) {
  const filter = Array.from(document.querySelectorAll('.filter-timeline'))
  filter.forEach(f => {
    f.addEventListener('click', event => {
      event.preventDefault()
      const timelineEvent = event.target.dataset.timeline
      showTimeline(causes, timeline, timelineEvent, true)
    })
  })
}

function prevent () {
  const dropdown = Array.from(document.querySelectorAll('.dropdown-trigger'))
  if (dropdown) {
    dropdown.forEach(element => element.addEventListener('click', e => e.preventDefault()))
  }
}

module.exports = { addCloseEvent, showTerritoryContent, manageTabs, setTooltip, clearTooltip, filterNetworkEvent, showTimeline, setAboutContent, clearAboutContent }