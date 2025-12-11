import { useEffect, useRef, useState, type RefObject } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InfiniteData,
  QueryKey,
  UndefinedInitialDataInfiniteOptions,
} from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import type { Message, User } from "@shared/prisma/client";

export type DirectMessaages = {
  messages: Message[];
  nextCursor?: number;
};

export type GroupMessages = DirectMessaages & {
  messages: (Message & { sender: Omit<User, "bio"> })[];
  nextCursor?: number;
};

type MessageResponse = DirectMessaages | GroupMessages;

type UseMessagesOptions<T> = UndefinedInitialDataInfiniteOptions<
  T,
  Error,
  InfiniteData<T, unknown>,
  QueryKey,
  number
>;

type UseMessagesReturnType<T extends MessageResponse> = {
  messages: T["messages"];
  fetchMoreMessages: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  canLoadMore: boolean;
  isFetching: boolean;
};

export function useMessagesQuery<T extends MessageResponse>(
  options: UseMessagesOptions<T>,
  messageType: "direct" | "group",
  socket?: Socket,
): Readonly<UseMessagesReturnType<T>> {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ first: true, scroll: false });
  const { data, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage } =
    useInfiniteQuery(options);

  const firstLoad = state.first && !isLoading;
  useEffect(() => {
    if (scrollRef.current && (firstLoad || state.scroll)) {
      scrollRef.current.scrollIntoView({
        behavior: firstLoad ? "instant" : "smooth",
      });
      setState({ first: false, scroll: false });
    }
  }, [state.scroll, firstLoad]);

  useEffect(() => {
    if (!socket) return;
    const listener = async (message: Message) => {
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      queryClient.setQueryData<
        InfiniteData<MessageResponse, number | undefined>
      >(options.queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          pageParams: oldData.pageParams,
          pages: [
            {
              messages: [message, ...oldData.pages[0].messages],
              nextCursor: oldData.pages[0].nextCursor,
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
      setState((s) => ({ ...s, scroll: true }));
    };
    socket.on(`receive_${messageType}`, listener);

    return () => {
      socket.off(`receive_${messageType}`, listener);
    };
  }, [socket?.connected]);

  const messages = data?.pages.flatMap((page) => page.messages).reverse() || [];
  const canLoadMore = hasNextPage && !isFetchingNextPage;
  const fetchMoreMessages = () => {
    if (!canLoadMore) return;
    fetchNextPage();
  };

  return {
    fetchMoreMessages,
    messages,
    scrollRef,
    canLoadMore,
    isFetching: isFetchingNextPage,
  } as const;
}
