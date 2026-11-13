# web/

Cliente web de SDUI: **Next.js 16 (App Router) + Tailwind v4**. Pide un screen al backend, lo valida, lo pinta y ejecuta sus acciones.

## Levantarlo

Requiere Node 22.

```bash
npm install
npm run dev        # http://localhost:3000
```

- **Con backend:** copia `.env.example` a `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Sin backend (solo desarrollo):** en `app/get-screen.ts`, cambia `fromSupabase` por `fromMock` siguiendo los comentarios. Pinta `mocks/home.json`.

La consola del navegador muestra `[analytics]` (eventos) y `[sdui]` (problemas).

## Qué hay aquí

Tres partes, una por responsable:

```
app/                          LA APP (Next.js): las pantallas y lo propio de este producto
  page.tsx                    Home: pide el screen, provee los handlers y lo pinta
  get-screen.ts               getScreen(screenId): el servicio que lee el screen de Supabase + parseScreen
  action-handlers.ts          qué hace cada acción en esta web (incluye la tabla de rutas)
  theme.css                   tokens de la marca y sus valores por tema
  layout.tsx · globals.css    layout raíz (columna de teléfono) y estilos globales
  product/[id]/page.tsx       destino de NAVIGATE → product_detail; no es server-driven

lib/                          LIBRERÍAS: sirven a cualquier proyecto, no conocen esta app
  use-future.ts               useFuture(fn): ejecuta una función async y guarda el resultado (data, hasError)
  cn.ts                       cn(): une clases de Tailwind (clsx + tailwind-merge)
  sdui/                       EL MOTOR SDUI: igual en cualquier app y, con los mismos nombres, en Flutter
    contract/                 qué llega del backend
      screen.ts               Screen, Section, parseScreen, semanticEnum
      action.ts               acciones core (NAVIGATE, TRACK_EVENT, OPEN_URL, SHOW_MESSAGE), triggers, CTA
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

sections/                     EL CATÁLOGO de la marca: todas las secciones, las use la pantalla que las use
  header-default.tsx …        una sección por archivo (contrato de props, vista, registro)
  home-registry.ts            cuáles de ellas pinta el home
  shared/                     lo que comparten varias secciones: cta-button, icons (Lucide)

mocks/home.json               un screen de ejemplo, para desarrollar sin backend
```

Las dependencias van en una dirección: `app → sections → lib`. Nada en `lib/` importa de `app/` ni de `sections/`: el motor no conoce rutas, URLs, analytics, Supabase ni la marca, y por eso se puede copiar a otra app (o publicar como paquete). Otra marca reutiliza `lib/sdui` con su propio `sections/`. Dentro de `lib/sdui/`, los `.ts` sin React (contrato, `registry.ts`, `resolve-section.ts`, `run-actions.ts`) son la lógica que Flutter replica tal cual; los archivos de React se reescriben con widgets.

## Flujo de una carga

```
app/page.tsx
  │ getScreen('home')                    app/get-screen.ts         → Supabase: vista sdui_screens
  │   parseScreen()                      lib/sdui/contract/screen.ts   valida solo el envelope
  │
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

- **Pedir un screen** no es parte de SDUI: es un fetch como cualquier otro. `getScreen(screenId)` lee la vista `sdui_screens` de Supabase (`screen_id`, `payload` con el Screen JSON) con su librería y valida el resultado con `parseScreen`, que es lo único que aporta el motor. Nada después de `get-screen.ts` sabe qué backend respondió.
- **`useFuture`** no es parte de SDUI ni sabe de screens: ejecuta cualquier función async y devuelve `{ data, hasError }`, como `FutureBuilder` (o `useFuture` de flutter_hooks) en Flutter.
- **Cargando y error** son un texto plano a propósito: cada app pone sus propios estados. El detalle del error va a la consola.
- **En Flutter es igual:** un repositorio con `supabase_flutter` y un Cubit (o `FutureBuilder`) con los mismos estados.
- **La clave es pública.** Al pedir desde el navegador, la URL y la clave publicable quedan a la vista (igual que dentro de una app). Antes de publicar, el rol `anon` solo debe poder leer la vista `sdui_screens`.
- **Las acciones** las declara el screen y las ejecuta la app (`app/action-handlers.ts`). `SHOW_MESSAGE` es el ejemplo más directo: el JSON trae el texto y cada plataforma decide cómo mostrarlo (aquí, un `alert` nativo; en Flutter, un `AlertDialog`). `NAVIGATE` usa ids de ruta que cada plataforma traduce (aquí, la tabla `ROUTES`; en Flutter, `go_router`).
- **El tema** llega en el screen (`"theme": "christmas"`). El renderer lo pone como `data-theme` y `app/theme.css` cambia los valores de los tokens en tiempo de ejecución; Tailwind solo genera en el build las clases (`bg-brand`) que leen esas variables. Un tema nuevo sí requiere publicar. (Flutter: `ThemeData` / `ThemeExtension`, también a nivel de app.)
- **Los íconos** del contrato son nombres semánticos (`cart`, `map_pin`); `sections/shared/icons.ts` los traduce a Lucide. Los íconos decorativos de una sección se importan de Lucide directamente.
- **Monitoreo:** `SduiProvider` acepta `onIssue`. Sin él, los problemas van a la consola (`reportIssue`).

## Agregar una sección

1. Crea `sections/mi-seccion.tsx` con su schema, su vista y `defineSection(...)`.
2. Agrégala al registry de la pantalla que la usa (`sections/home-registry.ts`).
3. Úsala en `mocks/home.json` y documenta sus props en `CONTRACT.md`.

Para otra pantalla (PLP, checkout): su `<pantalla>-registry.ts` y su `page.tsx`, que llama a `getScreen('<pantalla>')`.

## Probar la resiliencia

Conecta el mock (ver «Levantarlo»), edita `mocks/home.json` y recarga: cambia un `type` por uno que no existe, borra un `title` obligatorio o sube una `version`. En desarrollo, cada sección omitida aparece como un recuadro amarillo con su motivo; en producción simplemente no aparece. Los códigos están en `CONTRACT.md`.
