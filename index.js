let R = require('ramda')
let fs = require('fs')
let baby = require('babyparse')
let XMLWriter = require('xml-writer')

let pacerPath = __dirname + '/pacer/'
let stravaPath = __dirname + '/strava/'

let writeToXML = (fileName, data) => {
  let ws = fs.createWriteStream(stravaPath+fileName+'.xml')
  let xw = new XMLWriter
  xw.startDocument('1.0', 'UTF-8')
  xw.startElement('gpx')
  xw.writeAttribute('creator', 'pacer iPhone')
  xw.writeAttribute('version', '1.1')
  // meta
  xw.startElement('metadata')
  xw.writeElement('time', (new Date(data[0][0])).toISOString())
  xw.endElement('metadata')
  // track
  xw.startElement('trk')
  xw.startElement('trkseg')
  R.forEach(x=>{
    if (x && x.length >= 6 ) {
      xw.startElement('trkpt')
      xw.writeAttribute('lat', x[2])
      xw.writeAttribute('lon', x[3])
      xw.writeElement('ele', 0)
      xw.writeElement('time', (new Date(x[1])).toISOString())
      xw.endElement('trkpt')
    }
  }, data)
  xw.endElement('trkseg')
  xw.endElement('trk')
  xw.endDocument()
  ws.write(xw.toString(), 'UTF-8')
  ws.end()
}

R.compose(
  R.map(obj => writeToXML(obj.fileName, obj.data)),
  R.map(fileName => {
    let parsed = baby.parseFiles(pacerPath+fileName)
    return {
      fileName: fileName,
      data: R.drop(1, parsed.data)
    }
  })
)(fs.readdirSync(pacerPath))
