import { uniq } from 'lodash'
import { requestSheet } from './request'

function getOrganizations () {
  const data = requestSheet((data, tabletop) => {
    const table = tabletop.sheets('organizaciones').all().filter(row => row.priorizada.length)
    let departments = table
      .reduce((arr, row) => {
        row.puntos_geograficos.split(',').map(data => arr.push(data.trim()))
        return arr
      }, [])
      .filter(data => data != "")
    departments = uniq(departments)

    const organizations = departments
      .reduce((arr, department) => {
        arr[department] = []
        table.forEach((row) => {
          if (row.puntos_geograficos.includes(department)) {
            const data = {
              name: row.nombre_organizacion, uid: row.uid_org, description: row.descripcion, founded: row.fecha_fundacion, founder: row.nombre_lider, priority: +row.priorizada, profile: row.perfil, causes: row.causa ? row.causa.split(',') : [], contact: [ row['Página web'], row.correo_contacto, row.Facebook, row.twitter]
            }
            arr[department].push(data)
          }
        })
        return arr
      }, [])

    return organizations
  })
  return data
}

module.exports = { getOrganizations }
