
// --- overwrite: robust JSON loader & better errors ---
function fetchJSON(path){
  return fetch(path, {cache:'no-store'}).then(async (res)=>{
    if(!res.ok){
      const hint = (res.status===404? ' (404 — 파일 경로나 배포 폴더 확인)' : '');
      throw new Error(`HTTP ${res.status}${hint}: ${path}`);
    }
    const ct = (res.headers.get('content-type')||'').toLowerCase();
    const text = await res.text();
    if(!/application\/json|text\/json/.test(ct)){
      if(text.trim().startsWith('<!DOCTYPE')){
        throw new Error(`JSON 대신 HTML 수신: ${path} — GitHub Pages 경로/서브경로 문제 가능`);
      }
      try{ return JSON.parse(text); }catch(e){
        throw new Error(`JSON 파싱 실패: ${path} — ${e.message}`);
      }
    }
    try{ return JSON.parse(text); }catch(e){
      throw new Error(`JSON 파싱 실패: ${path} — ${e.message}`);
    }
  });
}

const chat = document.getElementById('chat');
const inp = document.getElementById('inp');
const sendBtn = document.getElementById('send');
const resultCard = document.getElementById('resultCard');
const subjectChips = document.getElementById('subjectChips');
const gauge = document.getElementById('gauge');
const acuText = document.getElementById('acuText');
const advice = document.getElementById('advice');
const toMap = document.getElementById('toMap');
const retry = document.getElementById('retry');

let lastResult = null;

function bubble(text, who='bot'){
  const div = document.createElement('div');
  div.className = 'bubble ' + who;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function loadKcdSpec(){
  return await fetchJSON('data/kcd_specialty.json');
}

function getProfile(){
  try{
    return JSON.parse(localStorage.getItem('fd_profile')||'{}');
  }catch(e){return {}}
}

function saveLast(kcd, top3){
  lastResult = {kcd, top3};
}

async function classifyWithOpenAI(text, kcdData, profile){
  const apiKey = (window.ENV && ENV.OPENAI_API_KEY) || '';
  if(!apiKey || apiKey.startsWith('sk-REPLACE')){
    throw new Error('env.js의 OPENAI_API_KEY를 설정하세요.');
  }
  const kcdList = Object.keys(kcdData).slice(0, 5000); // safety cap
  const sys = '너는 환자 증상 텍스트를 한국표준질병사인분류 KCD8 코드 중 하나로 분류하는 도우미야. 가능한 KCD 후보 목록이 주어질 것이고, 반드시 그 목록 중 하나의 코드를 골라. 출력은 JSON으로만: {"kcd":"코드","confidence":0~1,"reason":"한 줄 근거"}';
  const pro = (profile && profile.consent) ? 
    `환자 프로필(참고): 나이=${profile.age||""}, 성별=${profile.sex||""}, 기저질환=${(profile.conditions||[]).join(",")}, 알레르기=${(profile.allergies||[]).join(",")}` : "";
  const user = `증상: """${text}""" \n가능한 KCD 코드들(중 하나만 선택): ${kcdList.join(", ")}\n${pro}`;

  const body = {
    model: "gpt-4o-mini",
    messages: [
      {role:"system", content: sys},
      {role:"user", content: user}
    ],
    temperature: 0.2,
    response_format: {"type":"json_object"}
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  const txt = await res.text();
  let json;
  try { json = JSON.parse(txt); } catch(e){
    if(txt.trim().startsWith('<!DOCTYPE')){
      throw new Error('OpenAI 응답이 HTML입니다 — 네트워크/프록시/브라우저 플러그인 문제 가능');
    }
    throw new Error('OpenAI 응답 파싱 실패: ' + e.message);
  }
  if(!res.ok){
    throw new Error(json.error?.message || 'OpenAI API 오류');
  }
  let parsed = {};
  try{ parsed = JSON.parse(json.choices[0].message.content); }catch(e){
    throw new Error('모델 응답(JSON) 파싱 실패');
  }
  return parsed;
}

function renderSubjects(top3){
  subjectChips.innerHTML = "";
  top3.forEach(t => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.textContent = `${t.name} · ${t.pct}%`;
    subjectChips.appendChild(el);
  });
}

function goMap(){
  if(!lastResult) return;
  const spec = encodeURIComponent(lastResult.top3.map(t=>t.name).join(","));
  location.href = `map.html?spec=${spec}`;
}

async function run(){
  const text = inp.value.trim();
  if(!text) return;
  bubble(text, 'user');
  inp.value = '';
  const profile = getProfile();
  try{
    const kcdData = await loadKcdSpec();
    bubble('증상을 분석하고 있어요...', 'bot');
    const cls = await classifyWithOpenAI(text, kcdData, profile);
    const kcd = cls.kcd;
    const rec = kcdData[kcd];
    if(!rec){
      bubble('해당 증상에 대한 KCD 매핑을 찾을 수 없어요. 다른 표현으로 시도해 주세요.', 'bot');
      return;
    }
    const top3 = rec.top3;
    const tri = await FD_TRIAGE.askFlow(text, profile);
    const severity = tri.level;
    const gaugePct = Math.min(100, Math.max(0, Math.round((severity-1)*25)));
    document.getElementById('resultCard').classList.remove('hidden');
    renderSubjects(top3);
    document.getElementById('gauge').style.width = gaugePct + '%';
    document.getElementById('acuText').textContent = `KTAS 유사 단계: ${severity}단계 · ${tri.label}`;
    document.getElementById('advice').innerHTML = tri.adviceHTML;
    saveLast(kcd, top3);
  }catch(e){
    bubble('오류: ' + e.message, 'bot');
  }
}

sendBtn?.addEventListener('click', run);
inp?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') run(); });
toMap?.addEventListener('click', goMap);
retry?.addEventListener('click', ()=>location.reload());
