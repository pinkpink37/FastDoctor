import React, { useEffect, useRef } from 'react'

export default function MapView({lat, lng}:{lat:number, lng:number}){
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    // @ts-ignore kakao global
    const kakao = (window as any).kakao
    if(!kakao || !kakao.maps){
      if(ref.current) ref.current.innerHTML = '<div style="padding:12px">Kakao Map SDK 키를 설정하면 지도가 표시됩니다.</div>'
      return
    }
    const container = ref.current!
    const center = new kakao.maps.LatLng(lat, lng)
    const map = new kakao.maps.Map(container, { center, level: 4 })
    new kakao.maps.Marker({ position:center, map })
  }, [lat,lng])
  return <div ref={ref} style={{width:'100%', height:360, borderRadius:16, border:'1px solid #e5e7eb'}}/>
}
