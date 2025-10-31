// Serial -> WebSocket bridge for Arduino sensors
import { SerialPort } from 'serialport'
import { WebSocketServer } from 'ws'

const WS_PORT = 8787
const SERIAL_PORT = process.env.SERIAL_PORT || 'COM3'
const BAUD = parseInt(process.env.SERIAL_BAUD||'9600',10)

const wss = new WebSocketServer({ port: WS_PORT })
wss.on('listening', ()=> console.log('WS listening on ws://127.0.0.1:'+WS_PORT))
wss.on('connection', (ws)=> ws.send(JSON.stringify({ok:true, ts:Date.now()})))

const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD })
port.on('open', ()=> console.log('Serial opened', SERIAL_PORT, BAUD))
port.on('data', (buf)=>{
  // Expect JSON lines: {"temperature":36.8,"heartRate":72}
  const line = buf.toString().trim()
  try{
    const obj = JSON.parse(line)
    const msg = JSON.stringify(obj)
    wss.clients.forEach(ws=>{ try{ ws.send(msg) }catch{} })
  }catch{ /* ignore non-json */ }
})
port.on('error', (e)=> console.error('Serial error', e))
