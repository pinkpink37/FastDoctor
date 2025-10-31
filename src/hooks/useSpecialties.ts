import { useEffect, useState } from 'react'
import data from '../data/kcd_specialty.json'
export type SpecialtyMap = Record<string, string[]>
export default function useSpecialties(){
  const [map,setMap]=useState<SpecialtyMap>({})
  useEffect(()=>{
    // 데이터 정합성 체크
    if(data && typeof data==='object') setMap(data as SpecialtyMap)
  },[])
  return map
}
