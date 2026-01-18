const { app, BrowserWindow } = require('electron')
const path = require('path')

// On détermine si on est en développement ou en production
const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "BuddyAir",
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true, // Masque la barre de menu par défaut (style plus moderne)
  })

  if (isDev) {
    // En développement, on charge l'URL du serveur Nuxt
    // On attendra que le serveur soit prêt via le script npm
    win.loadURL('http://localhost:3000')
    // Ouvre les outils de développement (F12)
    // win.webContents.openDevTools()
  } else {
    // En production, on charge le fichier index.html généré
    win.loadFile(path.join(__dirname, '../.output/public/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})