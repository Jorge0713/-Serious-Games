const { app, BrowserWindow, protocol, net } = require("electron");
const path = require("path");

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  if (app.isPackaged) {
    win.loadURL("app://-/index.html");
  } else {
    win.loadURL("http://localhost:5173");
  }
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    protocol.handle('app', (request) => {
      let url = request.url.replace(/^app:\/\/-/, '');
      url = url.split('?')[0].split('#')[0];
      
      if (url === '/' || url === '') {
        url = '/index.html';
      }
      
      const absolutePath = path.join(__dirname, '../dist', url);
      return net.fetch('file://' + absolutePath);
    });
  }

  createWindow();
});