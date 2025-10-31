
function load(){
  try{
    const p = JSON.parse(localStorage.getItem('fd_profile')||'{}');
    if(p.age) document.getElementById('age').value = p.age;
    if(p.sex) document.getElementById('sex').value = p.sex;
    if(p.conditions) document.getElementById('conditions').value = p.conditions.join(', ');
    if(p.allergies) document.getElementById('allergies').value = p.allergies.join(', ');
    document.getElementById('consent').checked = !!p.consent;
  }catch(e){}
}
function save(){
  const p = {
    age: Number(document.getElementById('age').value||0),
    sex: document.getElementById('sex').value||'',
    conditions: (document.getElementById('conditions').value||'').split(',').map(s=>s.trim()).filter(Boolean),
    allergies: (document.getElementById('allergies').value||'').split(',').map(s=>s.trim()).filter(Boolean),
    consent: document.getElementById('consent').checked
  };
  localStorage.setItem('fd_profile', JSON.stringify(p));
  alert('저장되었습니다.');
}
document.getElementById('save').addEventListener('click', save);
document.addEventListener('DOMContentLoaded', load);
