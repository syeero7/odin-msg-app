import { useEffect, useRef, useState } from "react";

export function useScrollToView() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ first: true, scroll: true });

  useEffect(() => {
    if (!scrollRef.current) return;
    if (state.scroll) {
      scrollRef.current.scrollIntoView({
        behavior: state.first ? "instant" : "smooth",
      });
      setState({ first: false, scroll: false });
    }
  }, [state]);

  const scrollToView = () => {
    setState((s) => ({ ...s, scroll: true }));
  };

  return { scrollRef, scrollToView } as const;
}
