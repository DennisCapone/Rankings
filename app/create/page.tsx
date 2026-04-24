"use client";
import Button from '../../components/Button';
import Link from 'next/link';
import { useState } from 'react';
import { addRanking } from '../actions';
import { useRouter } from 'next/navigation';

export default function Create() {
  const router = useRouter()

  const [items, setItems] = useState(['', ''])
  const [name, setName] = useState("")

  const add = () => {if (items[items.length-1] !== "" && items[0] !== "") setItems([...items, ""])}
  const remove = (index:number) => {if (items.length > 2)setItems(items.filter((_, i) => i !== index))}
  const handleNameChange = (value:string) =>{setName(value)}
  const handleChange = (value:string, index:number) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
    if (value == "") remove(index)}
  const Save = async () => {
    const code = await addRanking(items, name)
    router.push(`/share/${code}`)}

  return (
    <>
      <div className='flex justify-center mt-30'><input
        type="text"
        onChange = {e => (handleNameChange(e.target.value))}
        placeholder = "Nome"
        className = 'mr-3 border-black border-solid border-2 h-14 text-xl outline-none rounded-xl'
      /></div>

      <div className='flex justify-center mt-5'><h1 className='mb-5 text-3xl'> Lista: </h1></div>
      {items.map((item, i) => (
        <div key={i} className='mb-3 ml-3 flex justify-center'>
          <input
            type="text"
            value = {item}
            onChange = {e => (handleChange(e.target.value, i))}
            placeholder = {`Elemento ${i+1}`}
            className = 'mr-3 border-black border-solid border-2 h-14 text-xl outline-none rounded-xl'
          />
          <button onClick={() => {remove(i)}} className='cursor-pointer border-black border-solid border-2 h-14 w-14 text-xl rounded-2xl'> X </button>
        </div>))}

      <div className='flex justify-center'><button onClick={() => add()} className='cursor-pointer rounded-2xl h-14 text-xl border-black border-solid border-2 w-35'> AGGIUNGI </button></div>
      <div className='flex justify-center'><button onClick={Save} className='flex justify-center mt-30'><Button text="CREA" color='bg-blue-700' textcolor='text-white' bcolor='' /></button></div>
      
      <Link href="/"><div className='flex justify-center mt-3'><Button text="Torna indietro" color="bg-red-300" textcolor='' bcolor='' /></div></Link>
    </>
  )
}
