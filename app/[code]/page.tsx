'use client'
import Button from "@/components/Button"
import Link from "next/link"
import { drawingNormal } from "../algorithms/drawings"
import { eloSystem } from "../algorithms/eloSystem"
import { useState, use, useEffect } from "react"

export default function Play({params} : {params: Promise<{code:string}>}) {
  const { code } = use(params)
  const  [textOne, setTextOne] = useState("Loading...")
  const  [textTwo, setTextTwo] = useState("Loading...")
  const giveQuestion = async() => {
    const players = await drawingNormal(); if (!players) throw new Error("No players found")
    setTextOne(players.p1.name)
    setTextTwo(players.p2.name)}
  useEffect(() => {giveQuestion()}, [giveQuestion])
  return (
    <>
      <Link href={`/${code}/ranking`}><div className='ml-5 mt-5'><Button textcolor="" bcolor="" text="Classifica" color="bg-green-300" /></div></Link>
      <div className='flex justify-center mt-5 gap-10 mt-50'><button onClick={async () => {await eloSystem(true); await giveQuestion()}}><Button textcolor="" color="" bcolor="" text={textOne} /></button><button onClick={async () => {await eloSystem(false); await giveQuestion()}}><Button text={textTwo} textcolor="" bcolor="" color="" /></button></div>
      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )}