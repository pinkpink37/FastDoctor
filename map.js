
let map, myPos;
const listEl = document.getElementById('list');
const specTag = document.getElementById('specTag');

const SPEC_KEYWORDS = {
  "가정의학과":["가정의학과"],
  "내과":["내과"],
  "소아청소년과":["소아과","소아청소년과"],
  "정형외과":["정형외과"],
  "이비인후과":["이비인후과","이빈후과"],
  "신경외과":["신경외과"],
  "외과":["외과"],
  "안과":["안과"],
  "치과":["치과"],
  "비뇨의학과":["비뇨의학과","비뇨기과"],
  "산부인과":["산부인과"],
  "피부과":["피부과"],
  "정신건강의학과":["정신과","정신건강의학과"],
  "재활의학과":["재활의학과"],
  "마취통증의학과":["통증의학과","마취통증의학과"]
};

function parseQuery(){
  const p = new URLSearchParams(location.search);
  const spec = (p.get('spec')||'').split(',').filter(Boolean);
  return {spec};
}

// Parse 'hours_json' like: {"Mon":[["09:00","18:00"]],"Tue":[["09:00","18:00"]],...}
// Supports multiple intervals per day. Local time check.
function isOpenNow(hours){
  try{
    const now = new Date();
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const key = days[now.getDay()];
    const arr = hours[key] || [];
    const pad = (n)=> String(n).padStart(2,'0');
    const cur = pad(now.getHours()) + ':' + pad(now.getMinutes());
    for(const [start,end] of arr){
      if(start <= cur && cur <= end) return true;
    }
  }catch(e){}
  return false;
}

function norm(x, a, b){ if(b<=a) return 0; return (x-a)/(b-a); }

function scorePlace(p, minD, maxD){
  // weights: distance 0.5, rating 0.3, congestion 0.2 (if available)
  const w = {d:0.5, r:0.3, c:0.2};
  const d = p._distM || 999999;
  const r = (p.rating || 0);
  const c = (p.congestion || null); // smaller is better if provided
  let nd = 1 - Math.max(0, Math.min(1, norm(d, minD, maxD))); // closer → larger score
  let nr = Math.max(0, Math.min(1, r/5)); // 0~5 → 0~1
  let nc = (c==null)? null : (1 - Math.max(0, Math.min(1, c))); // 0~1 congestion ratio
  let sumW = (nc==null) ? (w.d + w.r) : (w.d + w.r + w.c);
  let s = w.d*nd + w.r*nr + (nc==null?0:w.c*nc);
  return s / sumW;
}

async function loadHospitalMaster(){
  try{
    const res = await fetch('data/hospitals_master.csv');
    if(!res.ok) throw new Error('no master');
    const text = await res.text();
    const rows = text.split(/\r?\n/).map(r=>r.split(','));
    const header = rows.shift();
    const idx = (name)=> header.indexOf(name);
    const idI = idx('id'), nameI = idx('name'), latI=idx('lat'), lngI=idx('lng');
    const addrI = idx('address'), specI = idx('specialties'), hoursI = idx('hours_json');
    const ratingI = idx('rating'), congI = idx('congestion');
    if(idI<0 || nameI<0 || latI<0 || lngI<0) throw new Error('bad header');
    const out = [];
    for(const r of rows){
      if(!r.length || !r[0]) continue;
      const item = {
        id: r[idI], place_name: r[nameI], y: parseFloat(r[latI]), x: parseFloat(r[lngI]),
        address_name: r[addrI]||'',
        specialties: (r[specI]||'').split('|').filter(Boolean),
        hours_json: r[hoursI]? JSON.parse(r[hoursI]): null,
        rating: ratingI>=0 && r[ratingI]? parseFloat(r[ratingI]): null,
        congestion: congI>=0 && r[congI]? parseFloat(r[congI]): null,
        source: 'master'
      };
      out.push(item);
    }
    return out;
  }catch(e){
    return null;
  }
}

function filterByOpenAndSpec(items, spec){
  const nowOpen = items.filter(it => !it.hours_json || isOpenNow(it.hours_json));
  const bySpec  = spec.length? nowOpen.filter(it => it.specialties.some(s => spec.includes(s))): nowOpen;
  return bySpec;
}

async function searchKakaoFallback(keyword, center){
  return new Promise(resolve=>{
    const places = new kakao.maps.services.Places();
    const options = {location: center, radius: 5000};
    places.keywordSearch(keyword, (data, status)=>{
      if(status !== kakao.maps.services.Status.OK){ resolve([]); return; }
      const out = data.map(d => ({
        id: d.id, place_name: d.place_name, y: parseFloat(d.y), x: parseFloat(d.x),
        address_name: d.road_address_name || d.address_name || '',
        rating: null, congestion: null, source: 'kakao', place_url: d.place_url
      }));
      resolve(out);
    }, options);
  });
}

function addMarkerAndList(p, idx){
  const marker = new kakao.maps.Marker({position: new kakao.maps.LatLng(p.y, p.x)});
  marker.setMap(map);
  const el = document.createElement('div');
  el.className = 'list-item';
  const right = p.place_url ? `<a class="r" href="${p.place_url}" target="_blank">정보</a>` : '';
  const dist = (p._distM!=null)? `${p._distM}m · `: '';
  el.innerHTML = `<div><div style="font-weight:700">${idx}. ${p.place_name}</div>
    <div class="small">${dist}${p.address_name||''}</div></div>${right}`;
  listEl.appendChild(el);
}

function computeDistanceM(aLat, aLng, bLat, bLng){
  const dx = (bLng-aLng)*88000;
  const dy = (bLat-aLat)*110000;
  return Math.round(Math.sqrt(dx*dx+dy*dy));
}

async function searchHospitals(){
  const {spec} = parseQuery();
  specTag.textContent = (spec[0]||'병원') + (spec[1]?` · ${spec[1]}`:'');
  const keywords = [].concat(...spec.map(s => SPEC_KEYWORDS[s]||[s]));
  const keyword = keywords[0] || '병원';

  // 1) Try hospital master
  let items = await loadHospitalMaster();
  if(items){
    // distance
    const aLat = myPos.getLat(), aLng = myPos.getLng();
    items.forEach(it => it._distM = computeDistanceM(aLat, aLng, it.y, it.x));
    // filter: open now + specialty
    let cand = filterByOpenAndSpec(items, spec);
    // sort by score
    const dists = cand.map(c=>c._distM);
    const minD = Math.min(...dists), maxD = Math.max(...dists);
    cand.forEach(c => c._score = scorePlace(c, minD, maxD));
    cand.sort((a,b)=> b._score - a._score);
    cand = cand.slice(0,20);

    if(cand.length){
      listEl.innerHTML = '';
      cand.forEach((p,i)=> addMarkerAndList(p, i+1));
      return;
    }
  }

  // 2) Fallback to Kakao places by keyword
  const places = await searchKakaoFallback(keyword, myPos);
  places.forEach(p => p._distM = computeDistanceM(myPos.getLat(), myPos.getLng(), p.y, p.x));
  places.sort((a,b)=> a._distM - b._distM);
  listEl.innerHTML = '';
  places.slice(0,20).forEach((p,i)=> addMarkerAndList(p, i+1));
}

function initKakao(){
  if(!window.kakao || !kakao.maps){
    setTimeout(initKakao, 300);
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    myPos = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    map = new kakao.maps.Map(document.getElementById('map'), {center: myPos, level: 4});
    const marker = new kakao.maps.Marker({position: myPos});
    marker.setMap(map);
    searchHospitals();
  }, err => {
    alert('위치 권한이 필요합니다.');
  });
}

document.getElementById('recenter').addEventListener('click', ()=>{
  if(myPos && map) map.setCenter(myPos);
});

document.addEventListener('DOMContentLoaded', initKakao);
