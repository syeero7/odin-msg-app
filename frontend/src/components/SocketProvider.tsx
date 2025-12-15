import {
  createContext,
  use,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthProvider";
import { cfg } from "@/lib/env";
import { getItem } from "@/lib/storage";

const SocketContext = createContext<Socket | undefined>(undefined);

export const useSocket = () => use(SocketContext);

export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket>(undefined);
  const { user } = useAuth();
  const authenticated = !!user;

  useEffect(() => {
    if (!socketRef.current && authenticated) {
      socketRef.current = io(cfg.VITE_BACKEND_URL, {
        extraHeaders: {
          Authorization: `Bearer ${getItem()}`,
        },
        autoConnect: false,
      });
    }

    if (!socketRef.current) return;
    const socket = socketRef.current;
    socket.on("connect", () => console.log("ws connected"));
    socket.on("disconnect", () => console.log("ws disconnected"));
    socket.on("connect_error", (err) => console.error("ws error:", err));
    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = undefined;
    };
  }, [authenticated]);

  return <SocketContext value={socketRef.current}>{children}</SocketContext>;
}
