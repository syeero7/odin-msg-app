import { useState, type FormHTMLAttributes } from "react";
import { ImageUp, Send } from "lucide-react";
import { useFormStatus } from "react-dom";

type ChatFormProps = {
  formAction: FormHTMLAttributes<HTMLFormElement>["action"];
  disabled: boolean;
};

export function ChatForm({ disabled, formAction }: ChatFormProps) {
  const [selected, setSelected] = useState(false);

  return (
    <form
      action={formAction}
      className="flex gap-2 pt-3.5 max-md:pb-2 border-t border-t-muted sm:gap-4"
      onSubmit={() => setSelected(false)}
    >
      <FormItems
        disabled={disabled}
        selected={selected}
        setSelected={setSelected}
      />
    </form>
  );
}

type FormItemProps = {
  disabled: boolean;
  selected: boolean;
  setSelected: (v: boolean) => void;
};

function FormItems({ disabled, selected, setSelected }: FormItemProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <label aria-label="upload image" className="file-upload">
        <ImageUp className={selected ? "text-green-500" : ""} />
        <input
          type="file"
          name="image"
          accept="image/*"
          disabled={disabled || pending}
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
        disabled={disabled || pending}
        className="bg-muted grow p-2 text-sm min-w-32"
      />
      <button
        disabled={disabled || pending}
        className="size-9 hover:text-green-500"
      >
        <Send className="size-8" />
      </button>
    </>
  );
}
