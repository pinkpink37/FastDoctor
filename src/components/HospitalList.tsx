import React from 'react'
export type Hospital={id:string,name:string, distanceKm:number, rating?:number, openNow?:boolean, tags?:string[]}
export default function HospitalList({items,onSelect}:{items:Hospital[],onSelect:(id:string)=>void}){
  return <div className="list">
    {items.map((h,i)=>(
      <div key={h.id} className="card" onClick={()=>onSelect(h.id)} style={{cursor:'pointer'}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div><div style={{fontWeight:700}}>{i+1}. {h.name}</div>
          <div style={{fontSize:12,color:'#64748b'}}>{h.distanceKm.toFixed(2)} km • 평점 {h.rating??'-'}</div></div>
          <div className="badge">{h.openNow?'영업중':'영업종료'}</div>
        </div>
        {h.tags?.length? <div style={{marginTop:8, display:'flex', gap:6, flexWrap:'wrap'}}>
          {h.tags.map(t=><span key={t} className="badge">{t}</span>)}
        </div>:null}
      </div>
    ))}
  </div>
}
