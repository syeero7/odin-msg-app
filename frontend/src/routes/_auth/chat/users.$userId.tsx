import { ChatForm } from "@/components/ChatForm";
import { MessageCard } from "@/components/MessageCard";
import { Navbar } from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useScrollToView } from "@/hooks/use-scroll-view";
import { getDirectMessages } from "@/lib/api";
import { DIRECT_MSG } from "@/lib/query-keys";
import { userOptions } from "@/lib/query-options";
import { githubUsername, processFormData, profileImageURL } from "@/lib/utils";
import type { Message } from "@shared/prisma/client";
import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import z from "zod";

export const Route = createFileRoute("/_auth/chat/users/$userId")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(userOptions(params.userId));
  },
});

function directMessageOptions(recipient_id: number | string) {
  return infiniteQueryOptions({
    queryKey: DIRECT_MSG(recipient_id),
    queryFn: ({ pageParam }) => {
      const cursor = z.number().optional().parse(pageParam);
      return getDirectMessages({ cursor, recipient_id });
    },
    getNextPageParam: (last) => last.nextCursor,
    initialPageParam: 0,
  });
}

function RouteComponent() {
  const { userId } = Route.useParams();

  return (
    <main className="chat-container">
      <Header userId={userId} />
      <Chat userId={userId} />
      <Navbar />
    </main>
  );
}

function Header({ userId }: { userId: string }) {
  const { data } = useQuery(userOptions(userId));

  return (
    <header className="min-h-[4.5em] flex gap-4 items-center">
      {data && (
        <>
          <img
            alt=""
            src={profileImageURL(data.user, 40)}
            className="size-10 rounded-[50%] ml-4"
          />
          <h1 className="text-2xl font-bold">
            {githubUsername(data.user.username)}
          </h1>
        </>
      )}
    </header>
  );
}

function Chat({ userId }: { userId: string }) {
  const { queryClient, auth } = Route.useRouteContext();
  const socket = useSocket();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery(directMessageOptions(userId));
  const userQ = useQuery(userOptions(userId));
  const { scrollRef, scrollToView } = useScrollToView();

  const formAction = async (formData: FormData) => {
    if (!socket) return;
    const processed = await processFormData(formData);
    processed.forEach(({ type, content }) => {
      socket.emit(
        "send_direct",
        { content, recipientId: userId, contentType: type },
        (res: unknown) => console.log(res),
      );
    });
  };

  const messages = data?.pages.flatMap((page) => page.messages).reverse();

  useEffect(() => {
    if (!socket) return;
    const listener = async (message: Message) => {
      await queryClient.cancelQueries({ queryKey: DIRECT_MSG(userId) });
      queryClient.setQueryData<
        InfiniteData<
          Awaited<ReturnType<typeof getDirectMessages>>,
          number | undefined
        >
      >(DIRECT_MSG(userId), (old) => {
        if (!old) return old;
        return {
          pageParams: old.pageParams,
          pages: [
            {
              messages: [message, ...old.pages[0].messages],
              nextCursor: old.pages[0].nextCursor,
            },
            ...old.pages.slice(1),
          ],
        };
      });
      scrollToView();
    };
    socket.on("receive_direct", listener);

    return () => {
      socket.off("receive_direct", listener);
    };
  }, [socket?.connected]);

  const getSender = (id: number) => {
    if (auth.user?.id === id) {
      return auth.user;
    }

    return userQ.data!.user;
  };
  const loadMore = hasNextPage && !isFetchingNextPage;
  const loadMoreMessages = () => {
    if (!loadMore) return;
    fetchNextPage();
  };

  return (
    <section className="flex flex-col">
      <div className="overflow-y-auto ">
        <div className="flex">
          <button
            onClick={loadMoreMessages}
            disabled={!loadMore}
            className="mx-auto max-w-fit hover:text-green-500 border-2 my-1 px-3 py-1 text-sm rounded-[999px] flex gap-2 items-center"
          >
            <span>{isFetchingNextPage ? "Loading" : "Load more"}</span>
            {isFetchingNextPage && (
              <LoaderCircle className="animate-spin size-4" />
            )}
          </button>
        </div>
        {messages &&
          messages.length > 0 &&
          messages.map((msg) => (
            <MessageCard
              key={msg.id}
              message={msg}
              sender={getSender(msg.senderId)}
            />
          ))}
        <div ref={scrollRef}></div>
      </div>

      <ChatForm formAction={formAction} disabled={false} />
    </section>
  );
}
