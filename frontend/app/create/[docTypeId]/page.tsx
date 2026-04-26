import { DOC_REGISTRY } from "@/app/lib/doc-configs";
import CreatePageClient from "./CreatePageClient";

export function generateStaticParams() {
  return Object.keys(DOC_REGISTRY).map((docTypeId) => ({ docTypeId }));
}

interface Props {
  params: Promise<{ docTypeId: string }>;
}

export default async function CreatePage({ params }: Props) {
  const { docTypeId } = await params;
  return <CreatePageClient docTypeId={docTypeId} />;
}
