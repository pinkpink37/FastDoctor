import axios from 'axios'
export async function summarizeAdvice(prompt:string){
  const key = import.meta.env.VITE_OPENAI_API_KEY
  if(!key) return 'OpenAI 키가 설정되지 않아 기본 가이드를 표시합니다.'
  // NOTE: 실제 호출은 보안상 서버 프록시를 사용하세요.
  try{
    const r = await axios.post('https://api.openai.com/v1/chat/completions',{
      model:'gpt-4o-mini',
      messages:[{role:'system', content:'너는 한국어 의료 안내 요약 도우미야. 정보 제공 목적이며 의료 자문이 아님을 항상 고지해.'},
                {role:'user', content: prompt}],
      temperature:0.2
    }, { headers:{ Authorization:`Bearer ${key}` }})
    const text = r.data.choices?.[0]?.message?.content ?? ''
    return text
  }catch(e:any){
    return '모델 호출 실패: 기본 가이드를 표시합니다.'
  }
}
