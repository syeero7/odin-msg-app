import { useEffect } from "react";
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
  canLoadMore: boolean;
  isFetching: boolean;
};

export function useMessagesQuery<T extends MessageResponse>(
  options: UseMessagesOptions<T>,
  messageType: "direct" | "group",
  onReceive: () => void,
  socket?: Socket,
): Readonly<UseMessagesReturnType<T>> {
  const queryClient = useQueryClient();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery(options);

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
      onReceive();
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
    canLoadMore,
    isFetching: isFetchingNextPage,
  } as const;
}
