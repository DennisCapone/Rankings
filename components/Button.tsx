export default function Button({ color, text, textcolor, bcolor }: { color: string; text: string; textcolor: string; bcolor: string }) {
  return (
    <>
      <div className={`h-20 w-40 ${color} cursor-pointer rounded-3xl flex justify-center items-center ${bcolor} border-solid border-3 mb-1`}>
        <h1 className={`${textcolor} text-xl`}> {`${text}`} </h1>
      </div>
    </>
  )
}
