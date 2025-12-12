import { infiniteQueryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import z from "zod";

import { ChatForm } from "@/components/ChatForm";
import { MessageCard } from "@/components/MessageCard";
import { Navbar } from "@/components/Navbar";
import { LoadMoreButton } from "@/components/LoadMoreButton";
import { GoBack } from "@/components/GoBack";
import { useSocket } from "@/components/SocketProvider";
import { useMessagesQuery } from "@/hooks/use-messaages-query";
import { getGroupMessages } from "@/lib/api";
import { GROUP_MSG } from "@/lib/query-keys";
import { groupsOptions } from "@/lib/query-options";
import { groupImageURL, processFormData } from "@/lib/utils";
import type { Group } from "@shared/prisma/client";

export const Route = createFileRoute("/_auth/chat/groups/$groupId")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(groupsOptions(params.groupId));
  },
});

function groupMsgOptions(groupId: string | number) {
  return infiniteQueryOptions({
    queryKey: GROUP_MSG(groupId),
    queryFn: ({ pageParam }) => {
      const cursor = z.number().optional().parse(pageParam);
      return getGroupMessages({ cursor, recipient_id: groupId });
    },
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextCursor,
  });
}

function RouteComponent() {
  const { groupId } = Route.useParams();
  const { data, isLoading } = useQuery(groupsOptions(groupId));

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="chat-container">
      <Header group={data!.group} />
      <Chat group={data!.group} />
      <Navbar hiddenOnMobile />
    </main>
  );
}

function Header({ group }: { group: Group }) {
  const { auth } = Route.useRouteContext();

  return (
    <header className="min-h-[4.5em] flex gap-4 items-center">
      <GoBack to="/groups" hiddenOnDesktop />
      <img
        alt=""
        src={groupImageURL(group.id, group.name)}
        className="size-10 rounded-[50%] md:mx-4"
        fetchPriority="low"
      />
      <h1 className="text-2xl font-bold flex-1">{group.name}</h1>
      {auth.user!.id === group.creatorId && (
        <Link
          to="/groups/$groupId/settings"
          params={{ groupId: group.id.toString() }}
          viewTransition
          className="hover:text-cyan-500 mx-4 size-7"
        >
          <Settings aria-label="group settings" className="size-7" />
        </Link>
      )}
    </header>
  );
}

function Chat({ group }: { group: Group }) {
  const socket = useSocket();
  const { scrollRef, messages, isFetching, fetchMoreMessages, canLoadMore } =
    useMessagesQuery(groupMsgOptions(group.id), "group", socket);

  const formAction = async (formData: FormData) => {
    if (!socket) return;
    const processed = await processFormData(formData);
    processed.forEach(({ type, content }) => {
      socket.emit(
        "send_group",
        { content, recipientId: group.id, contentType: type },
        (res: unknown) => console.log(res),
      );
    });
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
          messages.map((msg: (typeof messages)[0]) => (
            <MessageCard key={msg.id} message={msg} sender={msg.sender} />
          ))}
        <div className="mt-auto" ref={scrollRef}></div>
      </div>

      <ChatForm formAction={formAction} disabled={isFetching} />
    </section>
  );
}
