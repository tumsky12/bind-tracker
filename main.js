// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem, dialog, ipcMain} = require('electron')
const path = require('path')
app.commandLine.appendSwitch("disable-gpu")
const ioHook = require('iohook');

const fs = require('fs');

const Store = require('./store.js');
//const { devNull } = require('os');

const defaultMainWindowSize = { width: 682, height: 129 }
const frameHeight = 59;
const frameWidth = 15;

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: defaultMainWindowSize,
    bindsTxt: null,
    imageDirectory: null,
    bFrameless: false
  }
});

let mainWindow;
let framelessWindow;

// Some APIs can only be used after this event occurs.
app.on('ready', () =>{
  createWindow(store.get('bFrameless'));
  ioHook.start();
})

app.on('window-all-closed', function () {
  //// On macOS it is common for applications and their menu bar
  //// to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') app.quit()
  app.quit();
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  createWindow(store.get('bFrameless'))
})

// Attach listener in the main process with the given ID
ipcMain.on('close-frameless', () => {
  store.set('bFrameless', false);
  createWindow(false);
  framelessWindow.close();
});

// Attach listener in the main process with the given ID
ipcMain.on('open-frameless', () => {
  store.set('bFrameless', true);
  createWindow(true);
  mainWindow.close();
});

function createWindow(bFrameless)
{
  let { width, height } = store.get('windowBounds');
  
  const newWindow  = new BrowserWindow({
    width: width - (bFrameless ? frameWidth : 0),
    height: height - (bFrameless ? frameHeight : 0),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false 
    },
    frame: (bFrameless ? false : true),
    icon: './icon.ico'
  })

  ioHook.on('keydown', (bFrameless ? framelessWindowKeyDownListner : mainWindowKeyDownListner))

  newWindow.on('resize', () => {
    let { width, height } = newWindow.getBounds();
    store.set('windowBounds', { width, height });
  });

  newWindow.on('closed', function () {
     ioHook.removeListener('keydown', (bFrameless ? framelessWindowKeyDownListner : mainWindowKeyDownListner))
     if(bFrameless){framelessWindow = null;}
     else{mainWindow = null;}
  })

  newWindow.loadFile('index.html')
  
  if(bFrameless)
  {
    if (!framelessWindow || framelessWindow === null) 
    framelessWindow = newWindow;
  }
  else
  {
    if (!mainWindow || mainWindow === null) 
    mainWindow = newWindow;
    const mainWindowMenu = Menu.buildFromTemplate(mainWindowTemplate);
    Menu.setApplicationMenu(mainWindowMenu);
  }
}

const getBindsFromUser = () => {
  const files = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      //{ name: 'Json Files', extensions: ['json'] }
    ]
  });

  if (!files) { return; }
  const file = files[0];
  const content = fs.readFileSync(file).toString();
  console.log(content);
  mainWindow.webContents.send('binds-selected', file, content);

};

const getImageDirectoryFromUser = () => {
  const path = dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (!path) { return; }
  console.log(path);
  mainWindow.webContents.send('images-selected', path);
};

var mainWindowKeyDownListner = function(event){
  keyEvent = {rawCode: event.rawCode, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey}
    mainWindow.webContents.send('keydown', event, keyEvent);
}

var framelessWindowKeyDownListner = function(event){
  keyEvent = {rawCode: event.rawCode, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey}
    framelessWindow.webContents.send('keydown', event, keyEvent);
}

const mainWindowTemplate = [
  {
    label: 'File',
    submenu: [
     { role: 'quit' },
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { 
        label: 'Select Binds',
        click: getBindsFromUser
      },
      { 
        label: 'Select Image Folder',
        click: getImageDirectoryFromUser
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Default Size',
        click: () => {mainWindow.setSize(defaultMainWindowSize.width, defaultMainWindowSize.height)}
      },
      {
        label: 'Hide Title Bar',
        click: () => {
          createWindow()
          mainWindow.close();
        }
      }        
    ]
  },
  {
    role: 'Help',
    submenu: [
      {
        label: 'Dev Tools',
        click: () => {mainWindow.webContents.openDevTools();}
      },
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://github.com/tumsky12/bind-tracker')
        }
      }
    ]
  }
]
