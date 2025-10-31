type Props={score:number}
export default function KtasGauge({score}:Props){
  const pct = Math.max(0, Math.min(100, score))
  let label='경증'
  if(pct>=71) label='중증'
  else if(pct>=31) label='중등'
  return (<div>
    <div className="gauge"><span style={{width:`${pct}%`}}/></div>
    <div style={{marginTop:6,fontSize:12,color:'#64748b'}}>위급도: <b>{pct}</b> / 100 — {label}</div>
  </div>)
}
