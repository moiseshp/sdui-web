/**
 * Home, in two halves:
 *   server  gets the screen and validates it  (get-screen-home.ts)
 *   client  renders it with the SDUI library  (home-screen.tsx)
 * If getting it fails, error.tsx shows the message and a retry button.
 *
 * Asking on the server is a web choice (Next.js): the browser receives the
 * screen with the first HTML, without a loading state. A Flutter app has no
 * server of its own, so it asks from the device and shows its own loading and
 * error states (e.g. a repository + Cubit). The screen, the contract and the
 * library are the same; only WHERE it is requested changes.
 */

import { connection } from 'next/server';
import { getScreenHome } from './get-screen-home';
import { HomeScreen } from './home-screen';

export default async function HomePage() {
  // Render on every request, never at build time: a change in the backend
  // must show up on the next reload.
  await connection();
  const screen = await getScreenHome();
  return <HomeScreen screen={screen} />;
}
