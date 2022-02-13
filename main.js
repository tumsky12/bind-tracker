// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem, dialog} = require('electron')
const path = require('path')
app.commandLine.appendSwitch("disable-gpu")

const fs = require('fs')



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 680,
    height: 129,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false 
    },//,
    //frame:false
    titleBarStyle: 'hidden',
    icon: './Icon.png'
  })

  //mainWindow.webContents.openDevTools();

  const isMac = process.platform === 'darwin'
  const template = [
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
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
          label: 'Select Images',
          click: getImageDirectoryFromUser
        }//,
        // { 
        //   label: 'Hide Menu',
        //   click: () => {mainWindow.setMenuBarVisibility(false)}
        // }//,
        // { role: 'separator' },
        // { label: 'Set CD' },       
        // { label: 'Set Max Abilities' },
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Dev Tools',
          click: () => {mainWindow.webContents.openDevTools()}
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

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
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

  //const file = files[0];
  //const content = fs.readFileSync(file).toString();

  console.log(path);
  mainWindow.webContents.send('images-selected', path);
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () =>{
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
