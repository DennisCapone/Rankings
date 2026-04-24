import Button from "@/components/Button"
import Link from "next/link"
import { fast_db } from "@/lib/fast_db"
import { Item } from "@/lib/redisFunctions"
import { notFound } from "next/navigation"

export default async function Ranking({params} : {params: Promise<{code:string}>}) {
  const { code } = await params                                                              
  const rawArray = await fast_db.zrange<any[]>(`fast_ranking:${code}`, 0, -1, { withScores: true, rev: true })
  if (!rawArray || rawArray.length === 0) notFound()                                        
  const parsedRanking: { member: string; score: number }[] = []
  if (typeof rawArray[0] === 'object' && rawArray[0] !== null) {
    parsedRanking.push(...rawArray)
  } else {
    for (let i = 0; i < rawArray.length; i += 2) parsedRanking.push({ member: String(rawArray[i]), score: Number(rawArray[i+1]) })}
  const validRanking = parsedRanking.filter(entry => entry.member && !isNaN(Number(entry.member)));
  const items: Item[] = await Promise.all(
    validRanking.map(async (entry) => {
      const name = await fast_db.hget<string>(`item:${entry.member}`, "name")
      return {
        id: BigInt(entry.member),
        name: name || "Sconosciuto",
        points: entry.score,}}))
  return (
    <>
      <div className="flex justify-center mt-30 gap-x-5">
        <div className="flex justify-center h-10 w-70"><h1>nome</h1></div>
        <div className="h-10 w-15 flex justify-center">pt</div>
        <div className="h-10 w-10 flex justify-center">pos</div>
      </div>
      {
        items.map((item:Item, index:number) => (
        <div key={(item.id).toString()} className="flex justify-center h-10 mt-3 gap-x-5">
        <div className="flex justify-center h-10 w-70 border-black border-solid border-3"><h1>{item.name}</h1></div>
        <div className="border-black border-solid border-3 h-10 w-15 flex justify-center">{item.points}</div>
        <div className="border-black border-solid border-3 h-10 w-10 flex justify-center">{index+1}</div>
        </div>))}
      <Link href={`/${code}`}><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna a giocare" color="bg-blue-300" /></div></Link>
      <Link href="/"><div className='flex justify-center mt-2'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>)}