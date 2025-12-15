import { useRouterState } from "@tanstack/react-router";
import { Loader } from "lucide-react";
import { useEffect, useState, type PropsWithChildren } from "react";

const DELAY = 500;

export function WithLoadingState({ children }: PropsWithChildren) {
  const [showLoading, setShowLoading] = useState(false);
  const { isLoading } = useRouterState();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isLoading) {
      timer = setTimeout(() => setShowLoading(true), DELAY);
    } else {
      clearTimeout(timer);
      setShowLoading(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <>
      {showLoading && (
        <div className="fixed flex items-center justify-center inset-0 h-screen w-screen bg-secondary/30">
          <Loader className="size-48 animate-spin" />
        </div>
      )}
      {children}
    </>
  );
}
