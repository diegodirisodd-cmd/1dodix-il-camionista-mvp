"use client";

import { useEffect, useId, useRef, useState } from "react";

export type PlaceValue = { city: string; province: string; region: string; lat: number; lng: number };

/**
 * Campo comune con suggerimenti: obbliga a scegliere un comune reale, cosi'
 * provincia, regione e coordinate sono sempre giuste (filtri, distanza,
 * avvisi WhatsApp mirati).
 */
export function PlaceInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: PlaceValue | null;
  onChange: (v: PlaceValue | null) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(value ? `${value.city} (${value.province})` : "");
  const [results, setResults] = useState<PlaceValue[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (value) setText(`${value.city} (${value.province})`);
  }, [value]);

  function search(q: string) {
    clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as PlaceValue[];
        setResults(data);
        setActive(0);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 150);
  }

  function pick(p: PlaceValue) {
    onChange(p);
    setText(`${p.city} (${p.province})`);
    setOpen(false);
  }

  return (
    <div className="form-field relative">
      <label className="label" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={id}
        className="input-field"
        value={text}
        placeholder={placeholder ?? "Scrivi il comune"}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        required={required}
        onChange={(e) => {
          setText(e.target.value);
          if (value) onChange(null);
          search(e.target.value);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            pick(results[active]);
          }
        }}
      />
      {text && !value && !open && <p className="mt-1 text-xs text-warning">Scegli un comune dall&apos;elenco.</p>}
      {open && results.length > 0 && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-cardHover"
        >
          {results.map((p, i) => (
            <li
              key={`${p.city}-${p.province}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(p);
              }}
              className={`flex min-h-[44px] cursor-pointer items-center justify-between px-3 text-sm ${i === active ? "bg-accent-50" : ""}`}
            >
              <span className="font-medium text-textStrong">
                {p.city} <span className="text-neutral-500">({p.province})</span>
              </span>
              <span className="text-xs text-neutral-400">{p.region}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
