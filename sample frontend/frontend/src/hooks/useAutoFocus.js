import { useEffect, useRef } from 'react';

export default function useAutoFocus() {
  const elementRef = useRef(null);

  useEffect(() => {
    elementRef.current?.focus();
  }, []);

  return elementRef;
}
