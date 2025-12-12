import { infiniteQueryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import z from "zod";

import { ChatForm } from "@/components/ChatForm";
import { MessageCard } from "@/components/MessageCard";
import { Navbar } from "@/components/Navbar";
import { LoadMoreButton } from "@/components/LoadMoreButton";
import { useSocket } from "@/components/SocketProvider";
import { useMessagesQuery } from "@/hooks/use-messaages-query";
import { getDirectMessages } from "@/lib/api";
import { DIRECT_MSG } from "@/lib/query-keys";
import { userOptions } from "@/lib/query-options";
import { githubUsername, processFormData, profileImageURL } from "@/lib/utils";
import type { User } from "@shared/prisma/client";

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
  const { data, isLoading } = useQuery(userOptions(userId));

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="chat-container">
      <Header user={data!.user} />
      <Chat user={data!.user} />
      <Navbar />
    </main>
  );
}

function Header({ user }: { user: User }) {
  return (
    <header className="min-h-[4.5em] flex gap-4 items-center">
      <img
        alt=""
        src={profileImageURL(user, 40)}
        className="size-10 rounded-[50%] ml-4"
        fetchPriority="low"
      />
      <h1 className="text-2xl font-bold">
        <Link
          to="/users/$userId"
          params={{ userId: user.id.toString() }}
          className="hover:text-cyan-500"
          viewTransition
        >
          {githubUsername(user.username)}
        </Link>
      </h1>
    </header>
  );
}

function Chat({ user }: { user: User }) {
  const { auth } = Route.useRouteContext();
  const socket = useSocket();
  const { scrollRef, messages, isFetching, fetchMoreMessages, canLoadMore } =
    useMessagesQuery(directMsgOptions(user.id), "direct", socket);

  const formAction = async (formData: FormData) => {
    if (!socket) return;
    const processed = await processFormData(formData);
    processed.forEach(({ type, content }) => {
      socket.emit(
        "send_direct",
        { content, recipientId: user.id, contentType: type },
        (res: unknown) => console.log(res),
      );
    });
  };

  const getSender = (id: number) => {
    if (auth.user?.id === id) {
      return auth.user;
    }

    return user;
  };

  return (
    <section className="flex flex-col">
      <div className="overflow-y-auto grow flex flex-col">
        <LoadMoreButton
          fetching={isFetching}
          fetcher={fetchMoreMessages}
          disabled={!canLoadMore}
        />
        {messages.length > 0 &&
          messages.map((msg) => (
            <MessageCard
              key={msg.id}
              message={msg}
              sender={getSender(msg.senderId)}
            />
          ))}
        <div className="mt-auto" ref={scrollRef}></div>
      </div>

      <ChatForm formAction={formAction} disabled={false} />
    </section>
  );
}
