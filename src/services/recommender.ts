import { haversine } from './geoutils'

export type Hospital = {
  id:string, name:string, lat:number, lng:number,
  rating?:number, openHours?:Record<string,{open:string, close:string}[]>,
  tags?:string[], specialties?:string[]
}

export function isOpenNow(hours?:Record<string,{open:string, close:string}[]>, now=new Date()){
  if(!hours) return false
  const day = ['sun','mon','tue','wed','thu','fri','sat'][now.getDay()]
  const ranges = hours[day]||[]
  const cur = now.toTimeString().slice(0,5) // HH:MM
  return ranges.some(r=> r.open<=cur && cur<=r.close )
}

export function selectTop20(user:{lat:number,lng:number}, items:Hospital[], weights={wd:0.5, wr:0.3, wc:0.2}){
  // 거리순 20 선별
  const withDistance = items.map(h=>{
    const d = haversine(user.lat,user.lng,h.lat,h.lng)
    return { ...h, distanceKm:d }
  }).sort((a,b)=> a.distanceKm-b.distanceKm).slice(0,20)

  // 혼잡도 없음 → 재가중
  const norm = weights.wd + weights.wr // wc 제외
  return withDistance.map(h=>{
    const dScore = 1/(1+ h.distanceKm) // 가까울수록 큼
    const rScore = (h.rating ?? 3)/5
    const score = (weights.wd/norm)*dScore + (weights.wr/norm)*rScore
    const tags = [
      h.rating && h.rating>=4.3 ? '평점높음' : (h.rating && h.rating<3 ? '평점낮음' : null),
    ].filter(Boolean) as string[]
    return {...h, score, tags}
  }).sort((a,b)=> b.score-a.score)
}
