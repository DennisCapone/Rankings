import ClientPart from "@/app/[code]/clientPart"
import { drawing } from "@/app/algorithms/drawings"
import { fast_db } from "@/lib/fast_db";

export default async function Play({ params }: { params: Promise<{ code: string }> }) {
  // Call all the client part from another component to be able to prefetche data and avoid loading times //
  const { code } = await params;
  const result = await drawing(code)
  if (!result) return null
  const [ initialPlayers ] = result

  // Reset the Redis at the open of the page //
  await fast_db.del(`queue:${code}`)
  await fast_db.del(`drawn_pairs:${code}`)

  // Defining the number of the pairs //
  const itemsLength = await fast_db.hlen(`ranking:${code}`)
  const numPairs = ((itemsLength+1) * (itemsLength/2))

  return <ClientPart code={code} initialPlayers={initialPlayers} numPairs={numPairs} />
}