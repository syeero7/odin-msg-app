import { infiniteQueryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import z from "zod";

import { ChatForm } from "@/components/ChatForm";
import { MessageCard } from "@/components/MessageCard";
import { Navbar } from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useMessagesQuery } from "@/hooks/use-messaages-query";
import { useScrollToView } from "@/hooks/use-scroll-view";
import { getDirectMessages } from "@/lib/api";
import { DIRECT_MSG } from "@/lib/query-keys";
import { userOptions } from "@/lib/query-options";
import { githubUsername, processFormData, profileImageURL } from "@/lib/utils";

export const Route = createFileRoute("/_auth/chat/users/$userId")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(userOptions(params.userId));
  },
});

function directMsgOptions(recipient_id: number | string) {
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
  const { auth } = Route.useRouteContext();
  const socket = useSocket();
  const { scrollRef, scrollToView } = useScrollToView();
  const { messages, isFetching, fetchMoreMessages, canLoadMore } =
    useMessagesQuery(directMsgOptions(userId), "direct", scrollToView, socket);
  const userQ = useQuery(userOptions(userId));

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

  const getSender = (id: number) => {
    if (auth.user?.id === id) {
      return auth.user;
    }

    return userQ.data!.user;
  };

  return (
    <section className="flex flex-col">
      <div className="overflow-y-auto ">
        <div className="flex">
          <button
            onClick={fetchMoreMessages}
            disabled={!canLoadMore}
            className="mx-auto max-w-fit hover:text-green-500 border-2 my-1 px-3 py-1 text-sm rounded-[999px] flex gap-2 items-center"
          >
            <span>{isFetching ? "Loading" : "Load more"}</span>
            {isFetching && <LoaderCircle className="animate-spin size-4" />}
          </button>
        </div>
        {messages.length > 0 &&
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
