import ClientPart from "./clientPart"
import { drawingNormal } from "@/app/algorithms/drawings"

export default async function Play({ params }: { params: Promise<{ code: string }> }) {
  // Call all the client part from another component to be able to prefetche data and avoid loading times //
  const { code } = await params;
  const initialPlayers = await drawingNormal(code);

  return <ClientPart code={code} initialPlayers={initialPlayers} />
}