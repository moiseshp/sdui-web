# web/

Cliente web de SDUI: **Next.js 16 (App Router) + Tailwind v4**. Pide un screen al backend, lo valida, lo pinta y ejecuta sus acciones.

## Levantarlo

Requiere Node 22. Copia `.env.example` a `.env.local`:

- **Con Supabase:** completa `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`, y borra `SCREEN_SOURCE`.
- **Con mocks (solo local):** deja `SCREEN_SOURCE=mocks` y levanta el servidor (`node mocks/server.mjs`, desde la raíz del repo).

```bash
npm install
npm run dev        # http://localhost:3000
```

La consola del navegador muestra `[analytics]` (eventos) y `[sdui]` (problemas).

## Qué hay aquí

Tres partes, una por responsable:

```
app/                          LA APP (Next.js): lo propio de este producto
  page.tsx                    Home (servidor): pide el screen con getScreenHome y se lo pasa a HomeScreen
  get-screen-home.ts          getScreenHome(): lee el home de Supabase (o de los mocks en local) + parseScreen
  home-screen.tsx             Home (cliente): provider con los handlers + renderer con el registry
  error.tsx                   si pedir el screen falla: mensaje y «Reintentar»
  home-registry.ts            qué secciones pinta el home
  action-handlers.ts          qué hace cada acción en esta web (incluye la tabla de rutas)
  layout.tsx · globals.css    layout raíz (columna de teléfono) y estilos globales
  product/[id]/page.tsx       destino de NAVIGATE → product_detail; no es server-driven

lib/                          LIBRERÍAS: sirven a cualquier producto, no conocen esta app
  cn.ts                       cn(): une clases de Tailwind (clsx + tailwind-merge)
  supabase.ts                 cliente de Supabase (solo servidor; URL y clave del env); no sabe qué leer
  sdui/                       EL MOTOR SDUI: igual en cualquier app y, con los mismos nombres, en Flutter
    contract/                 qué llega del backend
      screen.ts               Screen, Section, parseScreen, semanticEnum
      action.ts               acciones core (NAVIGATE, TRACK_EVENT, OPEN_URL), triggers, CTA
      issues.ts               códigos de problema y reportIssue (consola, por defecto)
    registry/                 qué sabe pintar el cliente
      registry.ts             SectionDefinition y createRegistry
      define-section.ts       defineSection: une un componente con su schema
      resolve-section.ts      ¿esta sección se puede pintar? (envelope → tipo → versión → props)
    actions/                  qué pasa al interactuar
      action-handlers.ts      la interfaz que toda app implementa
      run-actions.ts          ejecuta una lista de acciones en orden
      triggers.ts             usePressTrigger, useViewTrigger, useMountTrigger
      sdui-provider.tsx       pone handlers y reporter al alcance de todas las secciones
    screen/                   cómo se pinta
      screen-renderer.tsx     tema, onMount y los slots (header, sections, bottomBar)
      section-slot.tsx        resuelve, aísla y reporta cada sección

sections/                     EL CATÁLOGO de la marca: schema + vista de cada sección
  header-default.tsx …        una sección por archivo (contrato de props, vista, registro)
  shared/                     cta-button, icons (Lucide), theme.css (tokens de la marca)
  extras/                     secciones del catálogo que ninguna pantalla registra todavía
```

Las dependencias van en una dirección: `app → sections → lib`. Nada en `lib/` importa de `app/` ni de `sections/`: el motor no conoce rutas, URLs, analytics ni la marca, y por eso se puede copiar a otra app (o publicar como paquete). Otra marca reutiliza `lib/sdui` con su propio `sections/`. Dentro de `lib/sdui/`, los `.ts` sin React (contrato, `registry.ts`, `resolve-section.ts`, `run-actions.ts`) son la lógica que Flutter replica tal cual; los archivos de React se reescriben con widgets.

## Flujo de una carga

```
SERVIDOR
app/page.tsx
  │ getScreenHome()                      app/get-screen-home.ts    → Supabase: vista sdui_screens
  │                                                                → local: mocks GET /screens/home
  │   parseScreen()                      lib/sdui/contract/screen.ts   valida solo el envelope
  │
CLIENTE (el screen llega validado, con el primer HTML)
app/home-screen.tsx
  │ <SduiProvider handlers>              lib/sdui/actions/sdui-provider.tsx
  │   <ScreenRenderer registry>          lib/sdui/screen/screen-renderer.tsx   tema + onMount + slots
  │     <SectionSlot> × N                lib/sdui/screen/section-slot.tsx
  │       resolveSection()               lib/sdui/registry/resolve-section.ts  ¿se puede pintar?
  │       <HeroCarousel …/>              sections/hero-carousel.tsx
  │
  │ el usuario toca un botón
  │   usePressTrigger → runActions()     lib/sdui/actions/run-actions.ts
  │     handlers.NAVIGATE(...)           app/action-handlers.ts
```

## Dónde va cada cosa

- **Pedir un screen** es de la app, y en web se hace en el servidor: `getScreenHome()` lee la vista `sdui_screens` de Supabase (`screen_id`, `payload` con el Screen JSON). Cómo se arma ese JSON es trabajo del backend; el cliente solo lo lee. El motor aporta `parseScreen`, y nada después de `get-screen-home.ts` sabe qué backend respondió.
- **En Flutter se pide distinto.** Una app no tiene servidor propio: pide el screen desde el dispositivo (por ejemplo, un repositorio con `supabase_flutter` y un Cubit) y maneja sus propios estados de carga y error. Lo que no cambia es la vista que lee, el contrato y el motor: solo cambia **dónde** se pide.
- **El tema** llega en el screen (`"theme": "christmas"`). El renderer lo pone como `data-theme` y `sections/shared/theme.css` cambia los valores de los tokens en tiempo de ejecución; Tailwind solo genera en el build las clases (`bg-brand`) que leen esas variables. Un tema nuevo sí requiere publicar.
- **Los íconos** del contrato son nombres semánticos (`cart`, `map_pin`); `sections/shared/icons.ts` los traduce a Lucide. Los íconos decorativos de una sección se importan de Lucide directamente.
- **Monitoreo:** `SduiProvider` acepta `onIssue`. Sin él, los problemas van a la consola (`reportIssue`).

## Agregar una sección

1. Crea `sections/mi-seccion.tsx` con su schema, su vista y `defineSection(...)`.
2. Agrégala al registry de la pantalla que la usa (`app/home-registry.ts`).
3. Úsala en `mocks/screens/home.json` y documenta sus props en `CONTRACT.md`.

Para otra pantalla (PLP, checkout): su `get-screen-<pantalla>.ts`, su `<pantalla>-registry.ts`, su `page.tsx` y su componente cliente, con las secciones que necesite del catálogo.

## Probar la resiliencia

Desde la raíz del repo:

```bash
cp mocks/examples/home-lab.json mocks/screens/home.json
```

Recarga. En desarrollo, cada sección omitida aparece como un recuadro amarillo con su motivo; en producción simplemente no aparece. La tabla de qué esperar está en `mocks/README.md`.
