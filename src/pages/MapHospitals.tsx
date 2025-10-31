import React, { useMemo, useState } from 'react'
import MapView from '../components/MapView'
import HospitalList, { Hospital as Row } from '../components/HospitalList'
import { selectTop20, isOpenNow, Hospital } from '../services/recommender'

export default function MapHospitals(){
  const [user,setUser]=useState({lat:37.5665, lng:126.9780}) // 서울
  // 데모 데이터
  const hospitals:Hospital[] = useMemo(()=>[
    {id:'h1', name:'퍼스트내과의원', lat:37.566, lng:126.982, rating:4.5},
    {id:'h2', name:'센터흉부외과', lat:37.568, lng:126.975, rating:4.2},
    {id:'h3', name:'종합병원 응급실', lat:37.562, lng:126.973, rating:4.6},
    {id:'h4', name:'호흡기내과 전문의원', lat:37.571, lng:126.986, rating:4.0},
  ],[])
  const ranked = selectTop20(user, hospitals)
  const [selected,setSelected]=useState<string|undefined>()
  const rows:Row[] = ranked.map(h=>({
    id:h.id, name:h.name, distanceKm: (h as any).distanceKm, rating: h.rating, openNow:true, tags:h.tags
  }))

  return <div className="max-w-3xl mx-auto">
    <MapView lat={user.lat} lng={user.lng}/>
    <div className="card" style={{marginTop:10}}>
      <div className="handle"/><div style={{textAlign:'center',fontSize:12,color:'#64748b'}}>아래 리스트는 드래그 높이 조절 UI 컨셉</div>
      <HospitalList items={rows} onSelect={setSelected}/>
    </div>
  </div>
}
