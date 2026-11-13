'use client';

import { useEffect, useRef, useState } from 'react';

export function useFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [hasError, setHasError] = useState(false);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef
      .current()
      .then(setData)
      .catch(error => {
        console.error('[useFetch]', error);
        setHasError(true);
      });
  }, []);

  return { data, hasError };
}
