import Button from "@/components/Button"
import Link from "next/link"
import { fast_db } from "@/lib/fast_db"
import { Item } from "@/lib/redisFunctions"
import { notFound } from "next/navigation"

export default async function Ranking({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params   // Awaiting the code parameter from the URL //

  // Fetching the raw ranking data from Redis //
  const rawArray = await fast_db.zrange<string[]>(`fast_ranking:${code}`, 0, -1, { withScores: true, rev: true })
  if (!rawArray || rawArray.length === 0) notFound()
  
  // Transforming the raw ranking data into a more usable format //
  const ranking: { member: string; score: number }[] = []
  for (let i = 0; i < rawArray.length; i += 2) {
    ranking.push({
      member: String(rawArray[i]),
      score: Number(rawArray[i + 1])
    })
  } 

  // Creating the items array with the details of each player //
  const items: Item[] = await Promise.all(
    (ranking as { member: string, score: number }[]).map(async (item) => {
      const name = await fast_db.hget<string>(`item:${item.member}`, "name")
      return {
        id: BigInt(item.member),
        name: name || "Sconosciuto",
        points: item.score,
      }
    }
  ))


  return (
    <>
      <div className="flex justify-center mt-30 gap-x-5">
        <div className="flex justify-center h-10 w-70"><h1>nome</h1></div>
        <div className="h-10 w-15 flex justify-center">pt</div>
        <div className="h-10 w-10 flex justify-center">pos</div>
      </div>
      {
        items.map((item: Item, index: number) => (
          <div key={(item.id).toString()} className="flex justify-center h-10 mt-3 gap-x-5">
            <div className="flex justify-center h-10 w-70 border-black border-solid border-3"><h1>{item.name}</h1></div>
            <div className="border-black border-solid border-3 h-10 w-15 flex justify-center">{item.points}</div>
            <div className="border-black border-solid border-3 h-10 w-10 flex justify-center">{index + 1}</div>
          </div>))
      }
      <Link href={`/${code}`}><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna a giocare" color="bg-blue-300" /></div></Link>
      <Link href="/"><div className='flex justify-center mt-2'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}