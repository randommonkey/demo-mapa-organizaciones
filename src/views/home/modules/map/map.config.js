import L from 'leaflet'

const coordinates = {
  latitude: window.innerWidth >= 992 ? 4.688106 : 4.0991200,
  longitude: window.innerWidth >= 992 ? -78.851416 : -72.9564700,
}

const settings = {
  latitude: coordinates.latitude,
  longitude: coordinates.longitude,
  options: {
    maxZoom: 5.75,
    minZoom: window.innerWidth >= 992 ? 5 : 4.75,
    zoom: window.innerWidth >= 992 ? 5.5 : 4.75,
    zoomControl: false,
    zoomDelta: 0.25,
    zoomSnap: window.innerWidth >= 992 ? 0.25 : 0.15,
  },
  tileUrl: 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png'
}

function initializeMap (idSelector) {
  const map = L.map(idSelector, settings.options).setView([settings.latitude, settings.longitude], settings.options.zoom)
  L.tileLayer(settings.tileUrl).addTo(map)
  //map.setMaxBounds(map.getBounds())
  return map;
}

function loadGeoJSON (geojson, map) {
  L.geoJSON(geojson, {
    color: '#ffffff',
    fillColor: '#000000',
    fillOpacity: 1,
    weight: 1
  }).addTo(map)
}

function createGroup (map) {
  return L.featureGroup().addTo(map)
}

function addPointsToGroup (points, group, color, className, radius) {
  const options = {
    className,
    color,
    fillColor: color,
    fillOpacity: 1,
    radius: radius,
    weight: 1,
  }

  points.forEach(({ label, longitude, latitude }) => {
    options.label = label
    const circle = L.circle([latitude, longitude], options)
    circle.bindTooltip(label, { direction: 'top' }).addTo(group)
  })
}

module.exports = { initializeMap, loadGeoJSON, createGroup, addPointsToGroup }
