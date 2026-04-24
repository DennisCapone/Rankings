import Button from "@/components/Button"
import Link from "next/link"
import { drawingNormal } from "../algorithms/drawings"
import { eloSystem } from "../algorithms/eloSystem"

export default async function Play({params} : {params: Promise<{code:string}>}) {
  const { code } = await params               // Take the code from the url //
  const players = drawingNormal()
  let textOne = (await players).p1.name
  let textTwo = (await players).p2.name
  const giveQuestion = async() => {
    textOne = (await players).p1.name
    textTwo = (await players).p2.name}
  return (
    <>
      <Link href={`/${code}/ranking`}><div className='ml-5 mt-5'><Button textcolor="" bcolor="" text="Classifica" color="bg-green-300" /></div></Link>
      <div className='flex justify-center mt-5 gap-10 mt-50'><button onClick={() => {eloSystem(true); giveQuestion()}}><Button textcolor="" color="" bcolor="" text={textOne} /></button><button onClick={() => {eloSystem(false); giveQuestion()}}><Button text={textTwo} textcolor="" bcolor="" color="" /></button></div>
      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}
