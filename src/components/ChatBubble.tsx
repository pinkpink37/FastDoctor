import React from 'react'
export function UserBubble({children}:{children:React.ReactNode}){
  return <div style={{display:'flex', justifyContent:'flex-end'}}>
    <div className="card" style={{background:'#e0f2fe'}}>{children}</div>
  </div>
}
export function BotBubble({children}:{children:React.ReactNode}){
  return <div style={{display:'flex', justifyContent:'flex-start'}}>
    <div className="card" style={{background:'#f8fafc'}}>{children}</div>
  </div>
}
