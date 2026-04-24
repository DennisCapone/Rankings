"use client";
import Button from "@/components/Button"
import Link from "next/link";
import { useState } from "react";

export default function Play() {
  const [code, codeSet] = useState("")
  const handleChange = (value:string) => {if (value.length <= 8) {codeSet(value.toUpperCase())}}
  
  return (
    <>
      <div className="flex justify-center"><h1 className="text-3xl mt-20"> Inserisci il codice: </h1></div>
      <div className="flex justify-center mt-10">
      <input
        type="text"
        className = 'mr-3 border-black border-solid border-2 h-14 text-xl outline-none rounded-xl pl-5 pr-5'
        onChange={e => (handleChange(e.target.value))}
        value = {code}
      />
      </div>
      <Link href={`/${code}`}><div className='flex justify-center mt-5'><Button textcolor="" bcolor="" text="GIOCA" color="bg-blue-300" /></div></Link>
      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}
