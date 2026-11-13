'use client';

import { SduiProvider } from '@/lib/sdui/actions/sdui-provider';
import { ScreenRenderer } from '@/lib/sdui/screen/screen-renderer';
import { useFetch } from '@/lib/use-fetch';
import { homeRegistry } from '@/sections/home-registry';
import { useAppActionHandlers } from './action-handlers';
import { getScreen } from './get-screen';

export default function HomePage() {
  const handlers = useAppActionHandlers();
  const { data: screen, hasError } = useFetch(() => getScreen('home'));

  if (hasError) return <p className="p-6">No pudimos cargar el inicio. Inténtalo de nuevo en unos segundos.</p>;
  if (!screen) return <p className="p-6">Cargando…</p>;

  return (
    <SduiProvider handlers={handlers}>
      <ScreenRenderer screen={screen} registry={homeRegistry} />
    </SduiProvider>
  );
}
