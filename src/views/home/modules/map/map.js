import { initializeMap, loadGeoJSON, createGroup, addPointsToGroup } from './map.config'
import { showTerritoryContent } from '../events'
import { handleOverlayState } from '../utils'
import { getOrganizations } from '../organizations'
import { requestSheet } from '../request'
import { uniq, sortBy } from 'lodash'
import geojson from '../../../../data/colombia.json'
import Markdown from 'markdown-it'

const md = new Markdown()
const map = initializeMap('map')
const pointsGroup = createGroup(map)
let organizations
loadGeoJSON(geojson, map)

requestSheet((data, tabletop) => {
  const organizationsTable = tabletop.sheets('organizaciones').all().filter(row => row.priorizada.length)
  const actionsTable = tabletop.sheets('acciones').all()
  const papers = tabletop.sheets('publicaciones').all().filter(row => row.publicaciones_titulo.length)
  let departments = organizationsTable.reduce((arr, row) => {
    row.puntos_geograficos.split(',').map(data => arr.push(data.trim()))
    return arr
  }, []).filter(data => data != "")
  departments = uniq(departments)
  const organizations = departments.reduce((arr, department) => {
    arr[department] = []
    organizationsTable.forEach((row) => {
      if (row.puntos_geograficos.includes(department)) {
        const actions = actionsTable.filter(action => action.uid == row.uid_org).map(action => ({ uid: action.uid, date: action['año'], description: action.accion }))
        const publications = papers.filter(paper => paper.uid_org == row.uid_org).map(paper => ({
          uid: paper.uid_org, title: paper.publicaciones_titulo, url: paper.publicaciones_link, year: paper['publicaciones_año']
        }))
        const founders = row['nombre lider'].split(',')
        const data = { name: row.nombre_organizacion, uid: row.uid_org, description: row.descripcion, founded: row.fecha_fundacion, founder: founders, priority: +row.priorizada, profile: md.render(row.perfil), causes: row.causa ? row.causa.split(',') : [], contact: [ row['Página web'], row.correo_contacto, row.Facebook, row.twitter], actions, incidence: row.incidencia_local_nacional, publications, image: row.imagen_link, caption: row['crédito-foto'] }
        arr[department].push(data)
      }
    })
    arr[department] = sortBy(arr[department], [o => o.name])
    return arr
  }, [])

  const geoPoints = tabletop.sheets('puntos geograficos').all()
  const points = geoPoints.map(({ punto_geografico, latitud, longitud }) => ({ label: punto_geografico, latitude: +latitud, longitude: +longitud }))

  const radius = window.innerWidth >= 992 ? 20000 : 30000
  addPointsToGroup(points, pointsGroup, '#e93b38','department', radius)
  pointsGroup.on('click', function (event) {
    const point = event.layer
    const orgArray = organizations[point.options.label]
    const department = { department: point.options.label, organizations: orgArray }
    const territoryContentArea = document.getElementById('territories')
    handleOverlayState(territoryContentArea)
    showTerritoryContent(event, department)
  })
})

module.exports = map
