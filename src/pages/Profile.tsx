import React, { useEffect, useState } from 'react'

type Profile = {
  age:number
  conditions:string[]
  chronicNotes:string[]
  allergies:string[]
  consentToUseProfile:boolean
}

const KEY='fd_profile_v1'

export default function Profile(){
  const [p,setP]=useState<Profile>({age:17, conditions:[], chronicNotes:[], allergies:[], consentToUseProfile:false})
  useEffect(()=>{
    const raw = localStorage.getItem(KEY)
    if(raw) try{ setP(JSON.parse(raw)) }catch{}
  },[])
  useEffect(()=>{
    localStorage.setItem(KEY, JSON.stringify(p))
  },[p])
  function add(list:keyof Profile, val:string){
    if(!val) return
    setP(prev=>({...prev, [list]: [...(prev[list] as string[]), val]}))
  }
  return <div className="max-w-xl mx-auto card">
    <div style={{fontWeight:700, marginBottom:8}}>사용자 정보</div>
    <div className="row"><label style={{width:80}}>나이</label><input className="input" type="number" value={p.age} onChange={e=>setP({...p, age: parseInt(e.target.value||'0')})}/></div>
    <div style={{marginTop:8}}>
      <div className="badge">프롬프트에 사용 동의
        <input type="checkbox" checked={p.consentToUseProfile} onChange={e=>setP({...p, consentToUseProfile:e.target.checked})} style={{marginLeft:8}}/>
      </div>
    </div>
    <Section title="기저질환" items={p.conditions} onAdd={(v)=>add('conditions',v)}/>
    <Section title="평소 증상" items={p.chronicNotes} onAdd={(v)=>add('chronicNotes',v)}/>
    <Section title="알레르기" items={p.allergies} onAdd={(v)=>add('allergies',v)}/>
    <div className="badge" style={{marginTop:12}}>요약 배지: 나이 {p.age} / {p.conditions.join(',')||'기저질환 없음'} / {p.allergies.join(',')||'알레르기 없음'}</div>
  </div>
}

function Section({title, items, onAdd}:{title:string, items:string[], onAdd:(v:string)=>void}){
  const [val,setVal]=useState('')
  return <div style={{marginTop:12}}>
    <div style={{fontWeight:600}}>{title}</div>
    <div className="row" style={{marginTop:6}}>
      <input className="input" value={val} onChange={e=>setVal(e.target.value)} placeholder="추가할 항목"/>
      <button onClick={()=>{onAdd(val); setVal('')}}>추가</button>
    </div>
    <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:8}}>
      {items.map((it,i)=><span key={i} className="badge">{it}</span>)}
    </div>
  </div>
}
