import Link from 'next/link';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="p-5">
      <Link href="/" className="inline-block py-2 font-bold text-brand">
        Volver al inicio
      </Link>
      <h1 className="mt-6 mb-2 text-4xl font-black font-stretch-75%">{decodeURIComponent(id)}</h1>
      <p className="leading-relaxed text-muted">
        Llegaste con <code className="font-mono text-[13px] text-ink">{'{ route: "product_detail", params: { id } }'}</code>. La
        web lo tradujo a <code className="font-mono text-[13px] text-ink">/product/{id}</code>; Flutter lo traduce a su propia
        ruta.
      </p>
    </div>
  );
}
