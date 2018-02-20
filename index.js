const express = require('express')
const http = require('http')
const path = require('path')

const port = process.env.PORT || 3000
const app = express()

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

const server = http.createServer(app)

server.listen(port, () => console.log(`Running on port ${port}`))