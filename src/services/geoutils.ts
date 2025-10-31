export function haversine(lat1:number, lon1:number, lat2:number, lon2:number){
  const R=6371, toRad=(d:number)=>d*Math.PI/180
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  return 2*R*Math.asin(Math.sqrt(a))
}
