import Button from "@/components/Button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { checkCode } from "@/app/actions"

export default async function Play({params} : {params: Promise<{code:string}>}) {
  const { code } = await params      // Take the code from the url //
  if (!checkCode(code)) notFound()         // Check if the code is present in the db //
  
  return (
    <>
      <Link href={`/${code}/ranking`}><div className='ml-5 mt-5'><Button textcolor="" bcolor="" text="Classifica" color="bg-green-300" /></div></Link>
      <div className='flex justify-center mt-5 gap-10 mt-50'><Button textcolor="" color="" bcolor="" text="Opzione 1" /><Button text="Opzione 2" textcolor="" bcolor="" color="" /></div>
      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}
