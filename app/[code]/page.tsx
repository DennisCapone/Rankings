import Button from "../../components/Button"
import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function Play({params} : {params: Promise<{code:string}>}) {
  const { code } = await params
    const ranking = await db.ranking.findUnique({
      where: {
        code: code,
      },
      include: {
          items: {
              orderBy: {
                  points: "desc"
              }
          }
      }
    })
    if (!ranking) notFound()

  return (
    <>
      <Link href={`/${code}/ranking`}><div className='ml-5 mt-5'><Button textcolor="" bcolor="" text="Classifica" color="bg-green-300" /></div></Link>
      <div className='flex justify-center mt-5 gap-10 mt-50'><Button textcolor="" color="" bcolor="" text="Opzione 1" /><Button text="Opzione 2" textcolor="" bcolor="" color="" /></div>
      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}
