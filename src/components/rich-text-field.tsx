"use client";

import { useRef, useState } from "react";

export function RichTextField({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  const editor = useRef<HTMLDivElement>(null); const [value, setValue] = useState("");
  function format(command: "bold" | "italic" | "insertUnorderedList") { editor.current?.focus(); document.execCommand(command); setValue(editor.current?.innerHTML ?? ""); }
  return <label className="grid gap-2 text-sm font-semibold"><span>{label}</span><div className="border border-[#c9c3b9] focus-within:border-[#8c1515]"><div className="flex gap-1 border-b border-[#e4dfd7] bg-[#faf9f7] p-2"><button type="button" onClick={() => format("bold")} className="grid size-8 place-items-center font-bold hover:bg-[#ece8e1]">B</button><button type="button" onClick={() => format("italic")} className="grid size-8 place-items-center italic hover:bg-[#ece8e1]">I</button><button type="button" onClick={() => format("insertUnorderedList")} className="grid size-8 place-items-center hover:bg-[#ece8e1]">•≡</button></div><div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" onInput={(event) => setValue((event.target as HTMLDivElement).innerHTML)} className="min-h-32 px-3 py-3 font-normal leading-6 outline-none empty:before:text-zinc-400 empty:before:content-[attr(data-placeholder)]" data-placeholder={placeholder}/><input type="hidden" name={name} value={value}/></div></label>;
}
