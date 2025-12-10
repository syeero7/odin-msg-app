import { ImageUp, Send } from "lucide-react";
import { useState, type FormHTMLAttributes } from "react";

type ChatFormProps = {
  formAction: FormHTMLAttributes<HTMLFormElement>["action"];
  disabled: boolean;
};

export function ChatForm({ disabled, formAction }: ChatFormProps) {
  const [selected, setSelected] = useState(false);

  return (
    <form action={formAction} className="flex gap-4 px-2 py-3">
      <label aria-label="upload image" className="file-upload">
        <ImageUp className={selected ? "text-green-500" : ""} />
        <input
          type="file"
          name="image"
          accept="image/*"
          disabled={disabled}
          onChange={(e) => {
            const { files } = e.target;
            setSelected(files ? files.length > 0 : false);
          }}
        />
      </label>
      <input
        type="text"
        name="text"
        aria-label="text message"
        disabled={disabled}
        className="bg-muted grow p-2 text-sm"
      />
      <button disabled={disabled} className="size-9 hover:text-green-500">
        <Send className="size-8" />
      </button>
    </form>
  );
}
