import Button from '../../../components/Button';
import Link from 'next/link';

export default async function Share({params} : {params: Promise<{code:string}>}) {
  const { code } = await params;

  return (
    <>
      <div className='flex justify-center mt-20'><h1 className='text-xl'> Il tuo codice è: </h1></div>
      <div className='flex justify-center mt-5 select-text'><h1 className='text-6xl'> { code } </h1></div>
      <div className='flex justify-center mt-5 text-blue-700 underline select-text'><h1 className='text-xl'> <a href={`http://192.168.1.96:3000/${code}`}>http://192.168.1.96:3000/{code}</a></h1></div>

      <Link href={`/${code}`}><div className='flex justify-center mt-100'><Button text="GIOCA" color="bg-blue-400" bcolor='' textcolor='' /></div></Link>
      <Link href="/"><div className='flex justify-center mt-5'><Button text="Torna indietro" color="bg-red-300" bcolor='' textcolor='' /></div></Link>
    </>
  )
}
