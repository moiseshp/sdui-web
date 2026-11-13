'use client';

/**
 * Shown when getting the screen fails (backend down, invalid screen...).
 * `retry` asks the server again. Next only forwards the real message in
 * development; in production it is replaced with a generic one, so details
 * never leak to the browser (they stay in the server logs).
 */

export default function ScreenError({ error, retry }: { error: unknown; retry: () => void }) {
  const message =
    process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'No se pudo cargar la pantalla.';

  return (
    <div role="alert" className="grid min-h-[60dvh] place-content-center justify-items-center gap-4 p-6 text-center text-muted">
      <p>{message}</p>
      <button type="button" onClick={retry} className="min-h-11 cursor-pointer rounded-full bg-brand px-5 font-bold text-on-brand">
        Reintentar
      </button>
    </div>
  );
}
