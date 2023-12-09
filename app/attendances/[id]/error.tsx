"use client";

import ErrorView from "@/app/shared/components/ErrorView";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView error={error} />;
}
