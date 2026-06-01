"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { DEFAULT_USER_PASSWORD } from "@/lib/auth";
import type { Customer } from "@/lib/types";
import { filterCustomers } from "@/lib/customer-search";

const inputClass = "g-input";

export type CreateCustomerInput = {
  name: string;
  email: string;
  phone: string;
  locality: string;
  password?: string;
};

function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

function looksLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 6;
}

function guessCreateFieldsFromQuery(query: string): Partial<CreateCustomerInput> {
  const trimmed = query.trim();
  if (!trimmed) return {};

  if (looksLikeEmail(trimmed)) return { email: trimmed };
  if (looksLikePhone(trimmed)) return { phone: trimmed };
  return { name: trimmed };
}

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

function CustomerCreateForm({
  initial,
  onCancel,
  onCreate,
}: {
  initial?: Partial<CreateCustomerInput>;
  onCancel: () => void;
  onCreate: (input: CreateCustomerInput) => Promise<Customer>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [locality, setLocality] = useState(initial?.locality ?? "");
  const [password, setPassword] = useState(initial?.password ?? DEFAULT_USER_PASSWORD);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone are required.");
      return;
    }
    setCreating(true);
    try {
      await onCreate({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        locality: locality.trim(),
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create profile.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="g-customer-dropdown-create">
      <p className="g-customer-dropdown-create-title">Create new customer</p>
      <div className="g-customer-dropdown-create-grid">
        <input
          required
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          autoComplete="name"
        />
        <input
          required
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          inputMode="tel"
          autoComplete="tel"
        />
        <input
          required
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (login)"
          autoComplete="email"
        />
        <PasswordInput
          required
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <input
        className={inputClass}
        value={locality}
        onChange={(e) => setLocality(e.target.value)}
        placeholder="Locality / area (optional)"
      />
      {error ? <p className="g-customer-dropdown-create-error">{error}</p> : null}
      <div className="g-customer-dropdown-create-actions">
        <button type="button" className="g-btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="g-btn-primary" disabled={creating} onClick={handleCreate}>
          {creating ? "Creating…" : "Create & select"}
        </button>
      </div>
    </div>
  );
}

export function CustomerSelectDropdown({
  customers,
  selectedId,
  onSelect,
  onCreateCustomer,
  excludeCustomerIds = [],
  disabled = false,
  placeholder = "Select customer…",
  emptyMessage = "No customers match your search.",
}: {
  customers: Customer[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreateCustomer?: (input: CreateCustomerInput) => Promise<Customer>;
  excludeCustomerIds?: string[];
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createSeed, setCreateSeed] = useState<Partial<CreateCustomerInput>>({});
  const [recentCustomer, setRecentCustomer] = useState<Customer | null>(null);

  const canCreate = Boolean(onCreateCustomer);
  const excludedIds = useMemo(() => new Set(excludeCustomerIds), [excludeCustomerIds]);

  const selectableCustomers = useMemo(
    () => customers.filter((c) => !excludedIds.has(c.id)),
    [customers, excludedIds]
  );

  const selected =
    customers.find((c) => c.id === selectedId) ??
    (recentCustomer?.id === selectedId ? recentCustomer : undefined);

  const filtered = useMemo(
    () => filterCustomers(selectableCustomers, query).sort((a, b) => a.name.localeCompare(b.name)),
    [selectableCustomers, query]
  );

  const noMatches = query.trim().length > 0 && filtered.length === 0;

  useEffect(() => {
    if (selectedId && recentCustomer?.id === selectedId) {
      const fromList = customers.find((c) => c.id === selectedId);
      if (fromList) setRecentCustomer(null);
    }
  }, [customers, recentCustomer, selectedId]);

  useEffect(() => {
    if (!open || !canCreate) return;
    if (!selectableCustomers.length) {
      setShowCreateForm(true);
      setCreateSeed(noMatches ? guessCreateFieldsFromQuery(query) : {});
      return;
    }
    if (noMatches) {
      setShowCreateForm(true);
      setCreateSeed(guessCreateFieldsFromQuery(query));
    }
  }, [open, canCreate, selectableCustomers.length, noMatches, query]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        setShowCreateForm(false);
        setCreateSeed({});
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setShowCreateForm(false);
        setCreateSeed({});
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function resetPanel() {
    setQuery("");
    setShowCreateForm(false);
    setCreateSeed({});
  }

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
    resetPanel();
  }

  function handleToggle() {
    if (disabled) return;
    setOpen((prev) => {
      if (prev) resetPanel();
      return !prev;
    });
  }

  function openCreateForm(seed?: Partial<CreateCustomerInput>) {
    setShowCreateForm(true);
    setCreateSeed(seed ?? guessCreateFieldsFromQuery(query));
  }

  async function handleCreateCustomer(input: CreateCustomerInput): Promise<Customer> {
    if (!onCreateCustomer) {
      throw new Error("Customer creation is not available.");
    }
    const customer = await onCreateCustomer(input);
    setRecentCustomer(customer);
    setShowCreateForm(false);
    setCreateSeed({});
    setQuery("");
    onSelect(customer.id);
    setOpen(false);
    return customer;
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

          {!showCreateForm ? (
            <div className="g-customer-dropdown-list" role="listbox" aria-label="Customer profiles">
              {!selectableCustomers.length ? (
                <p className="g-muted g-customer-picker-empty">
                  {canCreate
                    ? customers.length
                      ? "All customers have active sessions. Create a new one below."
                      : "No customers yet. Create one below."
                    : emptyMessage}
                </p>
              ) : !filtered.length ? (
                <p className="g-muted g-customer-picker-empty">
                  {canCreate ? "No match found. Create a new customer below." : emptyMessage}
                </p>
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
          ) : null}

          {canCreate && showCreateForm ? (
            <CustomerCreateForm
              key={`${createSeed.name ?? ""}-${createSeed.email ?? ""}-${createSeed.phone ?? ""}`}
              initial={createSeed}
              onCancel={() => {
                setShowCreateForm(false);
                setCreateSeed({});
              }}
              onCreate={handleCreateCustomer}
            />
          ) : null}

          {canCreate && !showCreateForm ? (
            <div className="g-customer-dropdown-create-toggle">
              <button type="button" className="g-btn-ghost" onClick={() => openCreateForm()}>
                + Create new customer
              </button>
            </div>
          ) : null}

          {!showCreateForm && selectableCustomers.length > 0 ? (
            <p className="g-customer-dropdown-footer g-muted">
              {filtered.length} of {selectableCustomers.length} shown
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
