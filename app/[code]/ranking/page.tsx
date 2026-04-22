import Button from "../../../components/Button"
import Link from "next/link";
import { db } from "@/lib/db";
import { Item } from "@prisma/client";
import { notFound } from "next/navigation";

export default async function Ranking({params} : {params: Promise<{code:string}>}) {
  const { code } = await params
  const ranking = await db.ranking.findUnique({
    where: {code: code,},
    include: {items: {orderBy: { points: "desc"}}}
  })
  if (!ranking) notFound()
  return (
    <>
      <div className="flex justify-center mt-30 gap-x-5">
        <div className="flex justify-center h-10 w-70"><h1>nome</h1></div>
        <div className="h-10 w-15 flex justify-center">pt</div>
        <div className="h-10 w-10 flex justify-center">pos</div>
      </div>
      {
        ranking.items.map((item:Item, index:number) => (
        <div key={item.id} className="flex justify-center h-10 mt-3 gap-x-5">
        <div className="flex justify-center h-10 w-70 border-black border-solid border-3"><h1>{item.name}</h1></div>
        <div className="border-black border-solid border-3 h-10 w-15 flex justify-center">{item.points}</div>
        <div className="border-black border-solid border-3 h-10 w-10 flex justify-center">{index+1}</div>
        </div>))
      }
      <Link href={`/${code}`}><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna a giocare" color="bg-blue-300" /></div></Link>
      <Link href="/"><div className='flex justify-center mt-2'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}
