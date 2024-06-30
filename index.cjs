const { readFileSync } = require('fs');
const { createServer } = require('http');
const { Server, api_reply } = require('iosignal')


const httpServer = createServer((req, res) => {


  console.log('req url:', req.url)
  if (req.url == '/iosignal.min.js') {
    let content = readFileSync('node_modules/iosignal/dist/iosignal.min.js');
    let length = Buffer.byteLength(content);
    res.writeHead(200, {
      'Content-Type': 'text/javascript',
      'Content-Length': length
    });
    res.end(content);
  } else if (req.url == '/') {
    let content2 = readFileSync('index.html');
    let length2 = Buffer.byteLength(content2);
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': length2
    });
    res.end(content2);

  } else {
    res.writeHead(404);
    res.end('Not found');
    return;
  }


});


httpServer.listen(8080);


const options = {
  httpServer: httpServer,
  // showMetric: 2,
  // showMessage: 'message'
}
const ioss = new Server(options)

// api  response module
ioss.api('reply', api_reply)

ioss.on('text_message', (msg, socket) => {
  console.log(msg)
  socket.send('this is server')
})