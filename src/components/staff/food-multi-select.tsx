"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FoodItem } from "@/lib/types";
import { foodOptionLabel } from "@/lib/food";

type FoodMultiSelectDropdownProps = {
  items: FoodItem[];
  disabled?: boolean;
  onAdd: (foodIds: string[]) => Promise<void>;
  ariaLabel: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

export function FoodMultiSelectDropdown({
  items,
  disabled,
  onAdd,
  ariaLabel,
}: FoodMultiSelectDropdownProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function toggleItem(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

  async function handleAdd() {
    if (!selectedIds.length || adding) return;
    setAdding(true);
    try {
      await onAdd(selectedIds);
      setSelectedIds([]);
      setOpen(false);
    } finally {
      setAdding(false);
    }
  }

  const triggerLabel =
    selectedIds.length === 0
      ? "Select food items…"
      : `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"} selected`;

  const menu =
    open && menuPosition && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            className="g-food-multi-select-menu g-food-multi-select-menu-portal"
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            aria-multiselectable="true"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
          >
            {items.length ? (
              items.map((item) => {
                const checked = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    className={`g-food-multi-select-option${checked ? " is-selected" : ""}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <span className="g-food-multi-select-check" aria-hidden="true">
                      {checked ? "✓" : ""}
                    </span>
                    <span className="g-food-multi-select-name">
                      {foodOptionLabel(item.name, item.price)}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="g-food-multi-select-empty">No menu items yet.</p>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="g-food-multi-select" ref={rootRef}>
        <button
          ref={triggerRef}
          type="button"
          className="g-food-multi-select-trigger g-input g-input-compact"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled || adding}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="g-food-multi-select-label">{triggerLabel}</span>
          <span className="g-food-multi-select-chevron" aria-hidden="true">
            ▾
          </span>
        </button>

        <button
          type="button"
          className="g-btn-primary g-btn-compact g-food-multi-select-add"
          disabled={!selectedIds.length || disabled || adding}
          onClick={handleAdd}
        >
          {adding ? "Adding…" : selectedIds.length ? `Add (${selectedIds.length})` : "Add"}
        </button>
      </div>
      {menu}
    </>
  );
}
