const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Ici tu pourras exposer des fonctions sûres vers ton app Vue
  // Exemple :
  // sendNotification: (msg) => ipcRenderer.send('notify', msg)
})