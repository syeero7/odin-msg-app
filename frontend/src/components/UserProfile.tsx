import { useQuery, type UseMutationResult } from "@tanstack/react-query";
import type { FormHTMLAttributes } from "react";
import type { User } from "@shared/prisma/client";
import { userOptions } from "@/lib/query-options";
import { githubUsername, profileImageURL } from "@/lib/utils";

type UserProfileProps = {
  userId: string | number;
  formAction?: FormHTMLAttributes<HTMLFormElement>["action"];
  mutation?: UseMutationResult<unknown, Error, Pick<User, "bio">, unknown>;
};

export function UserProfile({
  userId,
  formAction,
  mutation,
}: UserProfileProps) {
  const { data, isLoading } = useQuery(userOptions(userId));

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const user = data!.user;
  const editProfile = formAction !== undefined && mutation !== undefined;

  return (
    <section>
      <img
        src={profileImageURL(user, 192)}
        alt="avatar"
        className="rounded-[50%] size-48 mx-auto mt-4"
      />
      <h1 className="text-center font-semibold text-3xl mt-3">
        {githubUsername(user.username)}
      </h1>

      <form action={formAction} className="py-3 px-2 grid">
        <fieldset disabled={!editProfile} className="unset-disabled">
          <label className="grid gap-1">
            <span>Bio:</span>
            <textarea
              rows={3}
              name="bio"
              disabled={mutation?.isPending || !editProfile}
              defaultValue={mutation?.variables?.bio || data?.user.bio || ""}
              className="bg-muted resize-none rounded-lg p-2 text-sm unset-disabled"
            ></textarea>
          </label>
        </fieldset>
        {editProfile && (
          <button
            disabled={mutation.isPending}
            className="text-xs py-2 px-4 border-2 border-muted-foreground rounded-lg font-semibold ml-auto mt-3  hover:text-green-500 hover:border-green-500"
          >
            Update
          </button>
        )}
      </form>
    </section>
  );
}
