import React, { useMemo, useState } from 'react'
import { BotBubble, UserBubble } from '../components/ChatBubble'
import KtasGauge from '../components/KtasGauge'
import useKtas from '../hooks/useKtas'
import useSpecialties from '../hooks/useSpecialties'
import { summarizeAdvice } from '../services/openai'
import { useNavigate } from 'react-router-dom'

export default function SymptomInput(){
  const [age, setAge] = useState<number>(17)
  const [text,setText]=useState('가슴이 답답하고 숨이 차요')
  const [messages,setMessages]=useState<{role:'user'|'bot', text:string}[]>([
    {role:'bot', text:'증상을 입력하세요. (예: 두통이 심하고 구토가 있어요)'}
  ])
  const [score,setScore]=useState(20)
  const ktas = useKtas(age)
  const specs = useSpecialties()
  const [finalSpec,setFinalSpec] = useState<string[]>([])
  const [advice,setAdvice]=useState<string>('')
  const nav = useNavigate()

  const handleSend = async ()=>{
    if(!text.trim()) return
    setMessages(m=>[...m,{role:'user',text}])
    // 데모: 텍스트에 따른 간단한 위급도·과목 매핑
    let sc=20, sp:string[]=['내과']
    const t=text
    if(/호흡|숨|호흡곤란|가슴/i.test(t)){ sc=75; sp=['흉부외과','호흡기내과','응급의학과'] }
    else if(/열|발열|고열|fever/i.test(t)){ sc=35; sp=['내과','감염내과','소아청소년과'] }
    else if(/복통|배가|토|구토|설사/i.test(t)){ sc=40; sp=['소화기내과','외과','응급의학과'] }
    setScore(sc)
    setFinalSpec(sp)

    const reply = `증상 요약: ${text}
나이: ${age}
예상 진료과목: ${sp.join(', ')}
위급도(추정): ${sc}/100`
    setMessages(m=>[...m,{role:'bot', text: reply}])
    const sum = await summarizeAdvice('다음 정보를 기반으로 짧은 권장 조치를 bullet로 요약해줘: '+reply+' (의료 자문 아님을 명시)')
    setAdvice(sum)
    setText('')
  }

  const complete = score>=75 || (finalSpec.length>0 && score>=35)

  return <div className="max-w-xl mx-auto">
    <div className="row" style={{justifyContent:'space-between', marginBottom:12}}>
      <div className="badge">나이
        <input className="input" type="number" value={age} onChange={e=>setAge(parseInt(e.target.value||'0'))} style={{width:90, marginLeft:8}}/>
      </div>
      <div className="badge">KTAS 코드 샘플: <code>{ktas.topCodes[0]}</code></div>
    </div>
    <div className="card" style={{minHeight:240, display:'flex', flexDirection:'column', gap:8}}>
      {messages.map((m,i)=> m.role==='user'
        ? <UserBubble key={i}>{m.text}</UserBubble>
        : <BotBubble key={i}>{m.text}</BotBubble>)}
      <div className="row" style={{marginTop:'auto'}}>
        <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="증상을 입력하세요"/>
        <button onClick={handleSend}>전송</button>
      </div>
    </div>

    {complete && <div className="card" style={{marginTop:12}}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <div style={{fontWeight:700}}>증상 파악 완료</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {finalSpec.map(s=><span key={s} className="badge">{s}</span>)}
        </div>
      </div>
      <div style={{marginTop:12}}><KtasGauge score={score}/></div>
      <div style={{marginTop:12, whiteSpace:'pre-wrap', fontSize:14}}>{advice}</div>
      <div style={{marginTop:12, textAlign:'right'}}>
        <button onClick={()=>nav('/map')}>지도로 이동하기</button>
      </div>
    </div>}
  </div>
}
