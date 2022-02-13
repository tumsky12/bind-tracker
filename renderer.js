const ioHook = require('iohook');
const fs = require('fs');

const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main.js');

const keycodeMappings = require('./keycodeMappings');

var jsonbinds 
var binds 
var directory

// var testBinds = JSON.parse(fs.readFileSync('./testBinds.txt'));
// var testDirectory = './bindIcons'
// RenderBinds(testBinds, testDirectory);

ipcRenderer.on('binds-selected', (event, file, content) => {
  //console.log(content);
  jsonbinds = content;
  try
  {
    binds = JSON.parse(jsonbinds);
  }
  catch(e){console.log(e)}
  if(binds && directory)
    RenderBinds(binds, directory);
});

ipcRenderer.on('images-selected', (event,  path) => {
  console.log(path);
  directory = path;
  if(binds && directory)
    RenderBinds(binds, directory);
});

async function RenderBinds(binds, imageDirectory)
{ 
  try
  {
    console.log(`Starting To Render Binds`)
    const ul = document.querySelector('ul');
    for (var i = 0; i < 10; i++) {
      const li = document.createElement('li');
      const cnt = document.createElement('div');
      cnt.setAttribute('class', 'container');
      li.appendChild(cnt);
      ul.appendChild(li);
    }

    var cdBinds = [];
    var bDWEquiped = true;

    ioHook.on('keydown', event => {
      const rawCode = event.rawcode;
      const bShift = event.shiftKey;
      const bCtrl = event.ctrlKey;
      const bAlt = event.altKey;

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
      img.src = `${imageDirectory}/${imageName}`
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
    ioHook.start();
  }
  catch(e){console.log(e)}
}


