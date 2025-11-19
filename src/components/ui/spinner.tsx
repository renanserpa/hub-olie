import { Loader2 } from "lucide-react";

export function Spinner() {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">Carregando...</span>
    </div>
  );
}