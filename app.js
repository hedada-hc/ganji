const electron = require("electron")
const app = electron.app
const BrowserWindow = electron.BrowserWindow
let win

//创建窗口
function CreateWindow(){
	win = new BrowserWindow({
		width:800,
		height:800,
		movable:true
	})
	win.loadURL(`file://${__dirname}/index.html`)
	win.webContents.openDevTools()
}

app.on('ready',CreateWindow)
app.on('window-all-colsed',()=>{
	app.quit()
})
