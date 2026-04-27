import ClientPart from "@/app/[code]/clientPart"
import { drawing } from "@/app/algorithms/drawings"

export default async function Play({ params }: { params: Promise<{ code: string }> }) {
  // Call all the client part from another component to be able to prefetche data and avoid loading times //
  const { code } = await params;
  const result = await drawing(code)
  if (!result) return
  const [ initialPlayers ] = result

  return <ClientPart code={code} initialPlayers={initialPlayers} />
}