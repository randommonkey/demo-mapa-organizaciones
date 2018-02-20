import Tabletop from 'tabletop'

function requestSheet (cb) {
  Tabletop.init({
    key: 'https://docs.google.com/spreadsheets/d/19o-AmYdgHNuqhfglKLcNbJW1V_rk6bOcSZiA-LIC-bE/edit?usp=sharing',
    callback: cb
  })
}

module.exports = { requestSheet }