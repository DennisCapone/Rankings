'use client'
import Button from "@/components/Button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { checkCode } from "@/app/actions"
import { drawingNormal } from "../algorithms/drawings"
import { eloSystem } from "../algorithms/eloSystem"
import { useState, use, useEffect, useCallback } from "react"

export default function Play({params} : {params: Promise<{code:string}>}) {
  const [idOne, idOneSet] = useState<bigint>(0);
  const [idTwo, idTwoSet] = useState<bigint>(0);
  const [textOne, textOneSet] = useState("")
  const [textTwo, textTwoSet ] = useState("")
  const { code } = use(params)             // Take the code from the url //
  const giveQuestion = useCallback(async () => {
    const chosens = await drawingNormal({params: Promise.resolve({code: code})})   // Take the 2 extracted items from the algorithm //
    if (chosens[0]) textOneSet(chosens[0].name); else textOneSet("")
    if (chosens[1]) textTwoSet(chosens[1].name); else textTwoSet("")
    if (chosens[0]) idOneSet(chosens[0].id); else idOneSet(0)
    if (chosens[1]) idTwoSet(chosens[1].id); else idTwoSet(0)}, [code])
  const updateRanking = async (aWinner: boolean) => {
    await eloSystem(idOne, idTwo, 100, aWinner)}
  useEffect(() => {
    const init = async () => {                                        // Create an async function to bypass useEffect's limitations
      const isValid = await checkCode(code)                       // Check if the code is present in the db //
      if (!isValid) return;
      await giveQuestion()}                                        // Call the first match
    init()}, [code, giveQuestion])
  
  
  return (
    <>
      <Link href={`/${code}/ranking`}><div className='ml-5 mt-5'><Button textcolor="" bcolor="" text="Classifica" color="bg-green-300" /></div></Link>
      <div className='flex justify-center mt-5 gap-10 mt-50'><button onClick={() => {updateRanking(true); giveQuestion()}}><Button textcolor="" color="" bcolor="" text={textOne} /></button><button onClick={() => {updateRanking(false); giveQuestion()}}><Button text={textTwo} textcolor="" bcolor="" color="" /></button></div>
      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}
