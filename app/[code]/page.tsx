import ClientPart from "@/app/[code]/clientPart"
import { drawing } from "@/app/algorithms/drawings"
import { fast_db } from "@/lib/fast_db";

export default async function Play({ params }: { params: Promise<{ code: string }> }) {
  // Call all the client part from another component to be able to prefetche data and avoid loading times //
  const { code } = await params;
  const result = await drawing(code)
  if (!result) return null
  const [ initialPlayers ] = result
  await fast_db.del(`queue:${code}`)

  return <ClientPart code={code} initialPlayers={initialPlayers} />
}