'use client';

/**
 * The three triggers of the contract, as React hooks. (`use` is React's
 * naming rule for hooks; the concepts are PressTrigger, ViewTrigger and
 * MountTrigger, as in Flutter.)
 *
 *   onPress  any pressable element
 *   onView   the first time a section is at least 50% visible
 *   onMount  once per loaded screen
 */

import { useEffect, useRef, type RefObject } from 'react';
import type { Triggers } from '../contract/action';
import { useDispatch } from './sdui-provider';

/**
 * The one pattern for anything pressable inside a section:
 *   const press = usePressTrigger(item.actions);
 *   <button disabled={!press.isPressable} onClick={press.onPress} />
 */
export function usePressTrigger(triggers: Triggers | undefined) {
  const dispatch = useDispatch();
  const actions = triggers?.onPress;
  return {
    isPressable: !!actions?.length,
    onPress: () => void dispatch(actions),
  };
}

export function useViewTrigger(ref: RefObject<HTMLElement | null>, actions: unknown[] | undefined) {
  const dispatch = useDispatch();
  const fired = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !actions?.length || fired.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting) || fired.current) return;
        fired.current = true;
        observer.disconnect();
        void dispatch(actions);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, actions, dispatch]);
}

/** Fires once per `key` (the screen id). Safe under React StrictMode. */
export function useMountTrigger(actions: unknown[] | undefined, key: string) {
  const dispatch = useDispatch();
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!actions?.length || firedFor.current === key) return;
    firedFor.current = key;
    void dispatch(actions);
  }, [actions, key, dispatch]);
}
