"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/app/lib/auth";
import { getDocConfig, DocTypeConfig } from "@/app/lib/doc-configs";
import { getDocument } from "@/app/lib/api-documents";
import { DocumentState } from "@/app/lib/doc-configs/types";
import DocumentCreator from "@/app/components/DocumentCreator";

interface Props {
  docTypeId: string;
}

function CreatePageInner({ docTypeId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<DocTypeConfig | null>(null);
  const [initialState, setInitialState] = useState<DocumentState | undefined>(undefined);
  const [initialDocumentId, setInitialDocumentId] = useState<number | null>(null);

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

    const idParam = searchParams.get("id");
    if (idParam) {
      const docId = parseInt(idParam, 10);
      getDocument(docId)
        .then((saved) => {
          try {
            setInitialState(JSON.parse(saved.state_json) as DocumentState);
            setInitialDocumentId(docId);
          } catch {
            // ignore parse error, start fresh
          }
          setConfig(cfg);
          setReady(true);
        })
        .catch(() => {
          router.replace("/documents");
        });
    } else {
      setConfig(cfg);
      setReady(true);
    }
  }, [router, docTypeId, searchParams]);

  if (!ready || !config) return null;

  return (
    <DocumentCreator
      config={config}
      initialState={initialState}
      initialDocumentId={initialDocumentId}
    />
  );
}

export default function CreatePageClient({ docTypeId }: Props) {
  return (
    <Suspense fallback={null}>
      <CreatePageInner docTypeId={docTypeId} />
    </Suspense>
  );
}
