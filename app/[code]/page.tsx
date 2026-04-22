'use client'
import Button from "@/components/Button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { checkCode } from "@/app/actions"
import { drawingNormal } from "../algorithms/drawings"
import { useState, use, useEffect } from "react"

export default function Play({params} : {params: Promise<{code:string}>}) {
  const [textOne, textOneSet] = useState("")
  const [textTwo, textTwoSet] = useState("")
  const { code } = use(params)             // Take the code from the url //
  useEffect(() => {                        // Check if the code is present in the db //
    if (!checkCode(code)) notFound();
    giveQuestion();
  }, [code]);        

  const giveQuestion = async () => {
    const chosens = await drawingNormal({params: Promise.resolve({code: code})})   // Take the 2 extracted items from the algorithm //
    chosens[0] ? textOneSet(chosens[0].name) : textOneSet("");
    chosens[1] ? textTwoSet(chosens[1].name) : textTwoSet("");
  };
  return (
    <>
      <Link href={`/${code}/ranking`}><div className='ml-5 mt-5'><Button textcolor="" bcolor="" text="Classifica" color="bg-green-300" /></div></Link>
      <div className='flex justify-center mt-5 gap-10 mt-50'><button onClick={() => giveQuestion()}><Button textcolor="" color="" bcolor="" text={textOne} /></button><button onClick={() => giveQuestion()}><Button text={textTwo} textcolor="" bcolor="" color="" /></button></div>
      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}
