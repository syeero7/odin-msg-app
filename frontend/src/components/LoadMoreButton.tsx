import { LoaderCircle } from "lucide-react";

type LoadMoreProps = {
  fetcher: () => void;
  disabled: boolean;
  fetching: boolean;
};

export function LoadMoreButton({ fetcher, disabled, fetching }: LoadMoreProps) {
  return (
    <div className="flex">
      <button
        onClick={fetcher}
        disabled={disabled}
        className="mx-auto max-w-fit hover:text-green-500 border-2 my-2 px-2 py-1 text-xs rounded-[999px] flex gap-2 items-center"
      >
        <span>{fetching ? "Loading" : "Load more"}</span>
        {fetching && <LoaderCircle className="animate-spin size-4" />}
      </button>
    </div>
  );
}
