import { useEffect, useState } from 'react'

export default function useSensorBridge(url: string){
  const [connected,setConnected]=useState(false)
  const [temp,setTemp]=useState<number|null>(null)
  const [hr,setHr]=useState<number|null>(null)
  useEffect(()=>{
    if(!url) return
    const ws = new WebSocket(url)
    ws.onopen=()=>setConnected(true)
    ws.onclose=()=>setConnected(false)
    ws.onmessage=(ev)=>{
      try{
        const obj = JSON.parse(ev.data)
        if(typeof obj.temperature==='number') setTemp(obj.temperature)
        if(typeof obj.heartRate==='number') setHr(obj.heartRate)
      }catch{}
    }
    return ()=>ws.close()
  },[url])
  return {connected, temperature:temp, heartRate:hr}
}
