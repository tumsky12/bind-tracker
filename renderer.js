//const ioHook = require('iohook');
const fs = require('fs');
const { remote, ipcRenderer } = require('electron');
const {Menu, MenuItem} = remote;
const mainProcess = remote.require('./main.js');
const keycodeMappings = require('./keycodeMappings');

const Store = require('./store.js');
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    bindsTxt: null,
    imageDirectory: null
  }
});

const bFrameless = store.get('bFrameless');
const menu = new Menu()
if(bFrameless)
{
  menu.append(
    new MenuItem ({
        label: 'Show Title Bar',
        click() {ipcRenderer.send('close-frameless');}
    })
  )
}
else
{
  menu.append(
    new MenuItem ({
        label: 'Hide Title Bar',
        click() {ipcRenderer.send('open-frameless');}
    })
  )
}
menu.append(
  new MenuItem ({
      label: 'Dev Tools',
      click() {remote.getCurrentWindow().webContents.openDevTools();}
  })
)
menu.append(
  new MenuItem ({
      label: 'Exit',
      click() {remote.getCurrentWindow().close();}
  })
)

 // Prevent default action of right click in chromium. Replace with our menu.
 window.addEventListener('contextmenu', (e) => {
   e.preventDefault()
   menu.popup(remote.getCurrentWindow())
 }, false)

console.log(`Starting To Render Binds`)
const ul = document.querySelector('ul');
for (var i = 0; i < 10; i++) {
  const li = document.createElement('li');
  const cnt = document.createElement('div');
  cnt.setAttribute('class', 'container');
  li.appendChild(cnt);
  ul.appendChild(li);
}

var txtBinds 
var binds 
var directory

//  var testBinds = JSON.parse(fs.readFileSync('./testBinds.txt'));
//  var testDirectory = './bindIcons'
 try
 { 
   txtBinds = store.get('bindsTxt');
   //console.log(txtBinds)
   binds = JSON.parse(txtBinds);
   directory = store.get('imageDirectory');
   //console.log(directory);
 }
 catch(e){console.log(e)}
//  binds = testBinds
//  directory = testDirectory
 RenderBinds();


ipcRenderer.on('binds-selected', (event, file, content) => {
  //console.log(content);
  jsonbinds = content;
  try
  { 
    store.set('bindsTxt', content);
    binds = JSON.parse(content);
    console.log(file);
  }
  catch(e){console.log(e)}
});

ipcRenderer.on('images-selected', (event,  path) => {
  store.set('imageDirectory', path);
  console.log(path);
  directory = path;
});

// ipcRenderer.on('keydown', (event) => {
//   if(!directory || !binds)
//     return;
//   const rawCode = event.rawcode;
//   const bShift = event.shiftKey;
//   const bCtrl = event.ctrlKey;
//   const bAlt = event.altKey;
//   console.log(rawCode);
//   if (!(rawCode in binds)){return}
//   const allKeysBindsArr = binds[rawCode].binds;
//   var bindObj;

//   bindObj = allKeysBindsArr.find(x => x.bShift === bShift && x.bCtrl === bCtrl && x.bAlt === bAlt && ((x.bDW && bDWEquiped ) || (x.b2H && !bDWEquiped)));
//   if (!bindObj){return}

//   let bindStr = bindObj.bindName;
//   let abrev = bindObj.abrev;  
//   let imageName = bindObj.image;

//   console.log(abrev);
//   if (abrev === '2H') { bDWEquiped = false }
//   if (abrev === 'MH') { bDWEquiped = true }    

//   if (cdBinds.includes(abrev)){return}

//   const li = document.createElement('li');
//   const cnt = document.createElement('div');
//   cnt.setAttribute('class', 'container');
//   const img = document.createElement('img')
//   img.src = `${directory}/${imageName}`
//   img.alt = bindStr;
//   const cntrTxt = document.createElement('div');
//   cntrTxt.setAttribute('class', 'centered');
//   const bindText = document.createTextNode(abrev);

//   cntrTxt.appendChild(bindText);
//   cnt.appendChild(img);
//   cnt.appendChild(cntrTxt);
//   li.appendChild(cnt);
//   ul.appendChild(li);
//   if (ul.children.length > 10) { ul.removeChild(ul.children[0]) }
//     cdBinds.push(abrev);  
//     setTimeout(() => {
//       cdBinds = cdBinds.filter(bind => bind != abrev);
//     }, 2000)

// });

async function RenderBinds()
{ 
  try
  {
    var cdBinds = [];
    var bDWEquiped = true;

    ipcRenderer.on('keydown', (event, keyEvent) => {
    event = keyEvent;
      if(!directory || !binds)
        return;
      const rawCode = event.rawcode;
      const bShift = event.shiftKey;
      const bCtrl = event.ctrlKey;
      const bAlt = event.altKey;
      console.log(rawCode);
      if (!(rawCode in binds)){return}
      const allKeysBindsArr = binds[rawCode].binds;
      var bindObj;

      bindObj = allKeysBindsArr.find(x => x.bShift === bShift && x.bCtrl === bCtrl && x.bAlt === bAlt && ((x.bDW && bDWEquiped ) || (x.b2H && !bDWEquiped)));
      if (!bindObj){return}

      let bindStr = bindObj.bindName;
      let abrev = bindObj.abrev;  
      let imageName = bindObj.image;

      console.log(abrev);
      if (abrev === '2H') { bDWEquiped = false }
      if (abrev === 'MH') { bDWEquiped = true }    

      if (cdBinds.includes(abrev)){return}

      const li = document.createElement('li');
      const cnt = document.createElement('div');
      cnt.setAttribute('class', 'container');
      const img = document.createElement('img')
      img.src = `${directory}/${imageName}`
      img.alt = bindStr;
      const cntrTxt = document.createElement('div');
      cntrTxt.setAttribute('class', 'centered');
      const bindText = document.createTextNode(abrev);

      cntrTxt.appendChild(bindText);
      cnt.appendChild(img);
      cnt.appendChild(cntrTxt);
      li.appendChild(cnt);
      ul.appendChild(li);
      if (ul.children.length > 10) { ul.removeChild(ul.children[0]) }
        cdBinds.push(abrev);  
        setTimeout(() => {
          cdBinds = cdBinds.filter(bind => bind != abrev);
        }, 2000)
    });

  }
  catch(e){console.log(e)}
}


