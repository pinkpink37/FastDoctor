
const FD_TRIAGE = (() => {

  async function loadKtas(age){
    const res = await fetch('data/ktas_rules.json');
    const j = await res.json();
    return age < 15 ? j.under15 : j.over15;
  }

  function findLevelFromText(text, keywordMinLevel){
    const lower = text.trim();
    let best = 6;
    for(const [kw, lvl] of Object.entries(keywordMinLevel || {})){
      if(!kw) continue;
      if(lower.includes(kw)){
        if(lvl < best) best = lvl;
      }
    }
    return best <= 5 ? best : null;
  }

  function labelOf(level){
    return {
      1: '즉시 응급(1단계) — 119 또는 응급실 권고',
      2: '응급(2단계) — 가능한 한 빨리 응급실',
      3: '준응급(3단계) — 오늘 내 진료 권장',
      4: '비응급(4단계) — 24~48시간 내 외래 권장',
      5: '경증(5단계) — 자가 관찰/약국 상담 가능'
    }[level];
  }

  function yesNo(q){
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'bubble bot';
      wrap.innerHTML = q + '<div class="row" style="margin-top:8px"><button class="btn" id="y">예</button><button class="btn secondary" id="n">아니오</button></div>';
      document.getElementById('chat').appendChild(wrap);
      const y = wrap.querySelector('#y'); const n = wrap.querySelector('#n');
      const done = (val)=>{ wrap.innerHTML = q + ' → ' + (val?'예':'아니오'); resolve(val); };
      y.onclick = ()=>done(true); n.onclick = ()=>done(false);
    });
  }

  async function askFlow(text, profile){
    const age = Number(profile?.age||0);
    const ktas = await loadKtas(age);
    // 1) 정식 룰(키워드 최소 단계) 기반 즉시 판정 시도
    const found = findLevelFromText(text, ktas.keyword_min_level);
    if(found){
      return {level: found, label: labelOf(found), adviceHTML: advise(found)};
    }

    // 2) 간이 Q&A (fallback)
    if(await yesNo('의식이 없거나, 심한 호흡곤란/질식, 심한 가슴통증, 대량출혈, 전신 경련 중 하나라도 있나요?')){
      return {level: 1, label: labelOf(1), adviceHTML: advise(1)};
    }
    if(await yesNo('알레르기 쇼크(입술/혀 붓기, 호흡곤란)나 심한 외상이 있나요?')){
      return {level: 2, label: labelOf(2), adviceHTML: advise(2)};
    }
    if(await yesNo(age < 15 ? '생후 3개월 미만이거나, 39℃ 이상의 고열인가요?' : '38.5℃ 이상의 고열 또는 참기 힘든 통증인가요?')){
      return {level: 3, label: labelOf(3), adviceHTML: advise(3)};
    }
    if(await yesNo('증상이 3일 이상 지속되거나 악화되고 있나요?')){
      return {level: 4, label: labelOf(4), adviceHTML: advise(4)};
    }
    return {level: 5, label: labelOf(5), adviceHTML: advise(5)};
  }

  function advise(level){
    switch(level){
      case 1: return '즉시 <b>119</b> 또는 가장 가까운 응급실로 이동하세요.';
      case 2: return '가능한 한 빨리 <b>응급실</b> 방문을 권고합니다.';
      case 3: return '오늘 내로 가까운 병원 방문을 권장합니다. 심해지면 응급실을 고려하세요.';
      case 4: return '가까운 의원/병원 외래 진료를 권장합니다.';
      case 5: return '휴식과 수분섭취 등 자가 관찰을 권장합니다. 악화 시 병원 방문.';
    }
    return '';
  }

  return { askFlow };
})();
