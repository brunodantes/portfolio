import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-sm font-medium text-eyebrow">Erro 404</span>
      <h1 className="font-display text-4xl md:text-5xl">Página não encontrada</h1>
      <Link href="/" className="text-sm hover:text-highlight">
        Voltar para o início
      </Link>
    </main>
  );
}
