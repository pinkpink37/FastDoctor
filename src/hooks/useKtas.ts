import { useMemo } from 'react'
import ktasAdult from '../data/ktas_flow_15plus.json'
import ktasChild from '../data/ktas_flow_under15.json'

type NodeL3 = { symptom:string, outcome?:{ktas:string}, code:string }
type NodeL2 = { symptom:string, level3: Record<string, NodeL3>, code:string }
type NodeL1 = { symptom:string, level2: Record<string, NodeL2>, code:string }
type Root = { level1: Record<string, NodeL1>, meta:{code:string} }
type KtasTree = Record<string, Root>

function flattenChoices(tree:KtasTree){
  // 간단히 top-level 코드 목록 반환
  return Object.keys(tree)
}

export default function useKtas(age:number){
  const tree = useMemo(()=> age>=15 ? (ktasAdult as any).tree as KtasTree : (ktasChild as any).tree as KtasTree ,[age])
  const topCodes = useMemo(()=>flattenChoices(tree),[tree])
  function resolve(code:string){
    const node = (tree as any)[code] as Root | undefined
    if(!node) return null
    // 가능한 경우 최심단 ktas를 반환
    // (데모: 바로 meta.code와 level1/2/3 하나만 있는 경우 추출)
    const l1Keys = Object.keys(node.level1||{})
    if(l1Keys.length===1){
      const l1 = node.level1[l1Keys[0]]
      const l2Keys = Object.keys(l1.level2||{})
      if(l2Keys.length===1){
        const l2 = l1.level2[l2Keys[0]]
        const l3Keys = Object.keys(l2.level3||{})
        if(l3Keys.length===1){
          const l3 = l2.level3[l3Keys[0]]
          return l3.outcome?.ktas ?? null
        }
      }
    }
    return null
  }
  return { tree, topCodes, resolve }
}
