function addClass (element, className) {
  element.classList.add(className)
}

function removeClass (element, className) {
  element.classList.remove(className)
}

function removeAllClasses(elements, className) {
  Array.from(elements).forEach(element => removeClass(element, className))
}

function toggleClass (element, className) {
  element.classList.toggle(className)
}

function containsClass (element, className) {
  return element.classList.contains(className)
}

function handleOverlayState (container) {
  const id = container.getAttribute('id')
  const overlay = document.querySelector('.overlay')
  const isOpened = containsClass(overlay, 'overlay-opened')
  const tabContent = Array.from(document.querySelectorAll('.tab-content'))
  
  tabContent.forEach(tab => tab.style.display = 'none')
  
  if (!isOpened) {
    addClass(overlay, 'overlay-opened')
  }
  container.style.display = 'block'
  return id
}
module.exports = { removeClass, addClass, toggleClass, containsClass, handleOverlayState, removeAllClasses }
