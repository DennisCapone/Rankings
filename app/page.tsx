import Button from "@/components/Button"
import Link from "next/link"

export default function Menu() {
  return (
    <div className="flex flex-col h-screen justify-center">
      <Link href="/create">
        <div className='flex justify-center'>
          <Button color="bg-blue-600" text="CREA" textcolor="text-white" bcolor="border-white" />
        </div>
      </Link>
      <Link href="/play">
        <div className='flex justify-center'>
          <Button color="bg-white" text="GIOCA" textcolor="text-black" bcolor="border-black" />
        </div>
      </Link>
    </div>
  )
}
