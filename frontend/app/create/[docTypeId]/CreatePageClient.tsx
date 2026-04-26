"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/app/lib/auth";
import { getDocConfig, DocTypeConfig } from "@/app/lib/doc-configs";
import DocumentCreator from "@/app/components/DocumentCreator";

interface Props {
  docTypeId: string;
}

export default function CreatePageClient({ docTypeId }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<DocTypeConfig | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const cfg = getDocConfig(docTypeId);
    if (!cfg) {
      router.replace("/");
      return;
    }
    setConfig(cfg);
    setReady(true);
  }, [router, docTypeId]);

  if (!ready || !config) return null;

  return <DocumentCreator config={config} />;
}
