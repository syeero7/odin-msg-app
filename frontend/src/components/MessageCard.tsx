import { githubUsername, profileImageURL } from "@/lib/utils";
import type { Message, User } from "@shared/prisma/client";

type MessageCardProps = {
  message: Message;
  sender: User;
};

export function MessageCard({ message, sender }: MessageCardProps) {
  return (
    <article className="flex gap-3 mb-2">
      <img
        alt=""
        src={profileImageURL(sender, 32)}
        className="size-8 rounded-[50%]"
      />
      <div className="grid">
        <strong>{githubUsername(sender.username)}</strong>
        <div className="mt-1 p-2 bg-muted rounded-lg">
          {message.text && <p className="text-sm">{message.text}</p>}
          {message.imageUrl && <img alt="" src={message.imageUrl} />}
        </div>
      </div>
    </article>
  );
}
