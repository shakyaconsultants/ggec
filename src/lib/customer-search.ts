import type { Customer } from "./types";

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function customerMatchesQuery(customer: Customer, query: string): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;

  const haystack = [customer.name, customer.email, customer.phone, customer.locality]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q) || q.split(/\s+/).every((part) => haystack.includes(part));
}

export function filterCustomers(customers: Customer[], query: string): Customer[] {
  return customers.filter((c) => customerMatchesQuery(c, query));
}

export function sessionMatchesCustomerName(customerName: string, query: string): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  const haystack = customerName.trim().toLowerCase();
  return haystack.includes(q) || q.split(/\s+/).every((part) => haystack.includes(part));
}
