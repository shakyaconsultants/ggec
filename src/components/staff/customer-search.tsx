"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

type PanelMode = "list" | "create";

type PanelPosition = {
  top: number;
  left: number;
  width: number;
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
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const createFormKeyRef = useRef(0);
  const userPrefersListRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [panelMode, setPanelMode] = useState<PanelMode>("list");
  const [createSeed, setCreateSeed] = useState<Partial<CreateCustomerInput>>({});
  const [recentCustomer, setRecentCustomer] = useState<Customer | null>(null);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);

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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedId && recentCustomer?.id === selectedId) {
      const fromList = customers.find((c) => c.id === selectedId);
      if (fromList) setRecentCustomer(null);
    }
  }, [customers, recentCustomer, selectedId]);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPanelPosition({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 320),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  const resetPanel = useCallback(() => {
    setQuery("");
    setPanelMode("list");
    setCreateSeed({});
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    resetPanel();
  }, [resetPanel]);

  const openCreateForm = useCallback(
    (seed?: Partial<CreateCustomerInput>) => {
      createFormKeyRef.current += 1;
      userPrefersListRef.current = false;
      setCreateSeed(seed ?? guessCreateFieldsFromQuery(query));
      setPanelMode("create");
    },
    [query]
  );

  const goBackToList = useCallback(() => {
    userPrefersListRef.current = true;
    setPanelMode("list");
    setCreateSeed({});
  }, []);

  useEffect(() => {
    if (!open || !canCreate || panelMode === "create") return;
    if (userPrefersListRef.current) return;

    if (!selectableCustomers.length) {
      openCreateForm(noMatches ? guessCreateFieldsFromQuery(query) : {});
      return;
    }

    if (noMatches) {
      openCreateForm(guessCreateFieldsFromQuery(query));
    }
  }, [open, canCreate, panelMode, selectableCustomers.length, noMatches, query, openCreateForm]);

  useEffect(() => {
    if (!open) return;

    function isInsidePanel(target: Node) {
      return (
        rootRef.current?.contains(target) === true || panelRef.current?.contains(target) === true
      );
    }

    function onPointerDown(e: PointerEvent) {
      if (isInsidePanel(e.target as Node)) return;
      if (panelMode === "create") return;
      closePanel();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (panelMode === "create") {
        setPanelMode("list");
        setCreateSeed({});
        return;
      }
      closePanel();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, panelMode, closePanel]);

  function handleSelect(id: string) {
    onSelect(id);
    closePanel();
  }

  function handleToggle() {
    if (disabled) return;
    if (open) {
      closePanel();
      return;
    }
    userPrefersListRef.current = false;
    if (canCreate && selectableCustomers.length === 0) {
      openCreateForm();
    } else {
      resetPanel();
    }
    setOpen(true);
  }

  async function handleCreateCustomer(input: CreateCustomerInput): Promise<Customer> {
    if (!onCreateCustomer) {
      throw new Error("Customer creation is not available.");
    }
    const customer = await onCreateCustomer(input);
    setRecentCustomer(customer);
    onSelect(customer.id);
    closePanel();
    return customer;
  }

  const panel =
    open && panelPosition && mounted ? (
      <div
        ref={panelRef}
        id={listboxId}
        className="g-customer-dropdown-panel g-customer-dropdown-panel-portal"
        style={{
          top: panelPosition.top,
          left: panelPosition.left,
          width: panelPosition.width,
        }}
        role="dialog"
        aria-label={panelMode === "create" ? "Create customer" : "Select customer"}
      >
        {panelMode === "create" ? (
          <div className="g-customer-dropdown-create-header">
            <button
              type="button"
              className="g-customer-dropdown-back"
              onClick={goBackToList}
            >
              ← Back to list
            </button>
            <p className="g-muted g-customer-dropdown-create-hint">
              Click outside is disabled while creating. Use Back or Cancel to return.
            </p>
          </div>
        ) : (
          <div className="g-customer-dropdown-search">
            <CustomerSearchInput
              value={query}
              onChange={(value) => {
                userPrefersListRef.current = false;
                setQuery(value);
              }}
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
        )}

        {panelMode === "list" ? (
          <>
            <div className="g-customer-dropdown-list" role="listbox" aria-label="Customer profiles">
              {!selectableCustomers.length ? (
                <p className="g-muted g-customer-picker-empty">
                  {canCreate
                    ? customers.length
                      ? "All customers have active sessions."
                      : "No customers yet."
                    : emptyMessage}
                </p>
              ) : !filtered.length ? (
                <p className="g-muted g-customer-picker-empty">
                  {canCreate ? "No match found." : emptyMessage}
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

            {canCreate ? (
              <div className="g-customer-dropdown-create-toggle">
                <button type="button" className="g-btn-ghost" onClick={() => openCreateForm()}>
                  + Create new customer
                </button>
              </div>
            ) : null}

            {selectableCustomers.length > 0 ? (
              <p className="g-customer-dropdown-footer g-muted">
                {filtered.length} of {selectableCustomers.length} shown
              </p>
            ) : null}
          </>
        ) : canCreate ? (
          <CustomerCreateForm
            key={createFormKeyRef.current}
            initial={createSeed}
            onCancel={() => {
              if (selectableCustomers.length === 0) {
                closePanel();
                return;
              }
              goBackToList();
            }}
            onCreate={handleCreateCustomer}
          />
        ) : null}
      </div>
    ) : null;

  return (
    <div
      ref={rootRef}
      className={`g-customer-dropdown${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="g-customer-dropdown-trigger g-input"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
      >
        <span className={selected ? "g-customer-dropdown-value" : "g-customer-dropdown-placeholder"}>
          {selected ? customerLabel(selected) : placeholder}
        </span>
        <span className="g-customer-dropdown-chevron" aria-hidden>
          ▾
        </span>
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
