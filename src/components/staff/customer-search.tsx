"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Customer } from "@/lib/types";
import { filterCustomers } from "@/lib/customer-search";

const inputClass = "g-input";

export function CustomerSearchInput({
  value,
  onChange,
  placeholder = "Search by name, phone, or locality…",
  id,
  autoFocus,
  onKeyDown,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="g-search-wrap">
      <input
        id={id}
        type="search"
        className={`${inputClass} g-search-input`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
      />
      {value ? (
        <button
          type="button"
          className="g-search-clear"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

function customerLabel(c: Customer): string {
  return `${c.name} · ${c.phone}${c.locality ? ` · ${c.locality}` : ""}`;
}

export function CustomerSelectDropdown({
  customers,
  selectedId,
  onSelect,
  disabled = false,
  placeholder = "Select customer…",
  emptyMessage = "No customers match your search.",
}: {
  customers: Customer[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = customers.find((c) => c.id === selectedId);

  const filtered = useMemo(
    () => filterCustomers(customers, query).sort((a, b) => a.name.localeCompare(b.name)),
    [customers, query]
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery("");
  }

  function handleToggle() {
    if (disabled) return;
    setOpen((prev) => {
      if (prev) setQuery("");
      return !prev;
    });
  }

  return (
    <div
      ref={rootRef}
      className={`g-customer-dropdown${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}`}
    >
      <button
        type="button"
        className="g-customer-dropdown-trigger g-input"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "g-customer-dropdown-value" : "g-customer-dropdown-placeholder"}>
          {selected ? customerLabel(selected) : placeholder}
        </span>
        <span className="g-customer-dropdown-chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="g-customer-dropdown-panel">
          <div className="g-customer-dropdown-search">
            <CustomerSearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search customers…"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length === 1) {
                  e.preventDefault();
                  handleSelect(filtered[0].id);
                }
              }}
            />
          </div>

          <div className="g-customer-dropdown-list" role="listbox" aria-label="Customer profiles">
            {!customers.length ? (
              <p className="g-muted g-customer-picker-empty">{emptyMessage}</p>
            ) : !filtered.length ? (
              <p className="g-muted g-customer-picker-empty">{emptyMessage}</p>
            ) : (
              filtered.map((c) => {
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`g-customer-picker-item${active ? " is-selected" : ""}`}
                    onClick={() => handleSelect(c.id)}
                  >
                    <span className="g-customer-picker-name">{c.name}</span>
                    <span className="g-customer-picker-meta">
                      {c.phone}
                      {c.locality ? ` · ${c.locality}` : ""}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {customers.length > 0 ? (
            <p className="g-customer-dropdown-footer g-muted">
              {filtered.length} of {customers.length} shown
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
