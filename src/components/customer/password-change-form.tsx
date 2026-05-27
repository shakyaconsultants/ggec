"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/app-providers";
import { PasswordInput } from "@/components/ui/password-input";

const inputClass = "g-input";

export function PasswordChangeForm({ email }: { email: string }) {
  const { changePassword } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await changePassword({ email, currentPassword, newPassword });
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="g-card" style={{ display: "grid", gap: "0.85rem", maxWidth: 480 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "1rem", color: "#e4e4e7" }}>Change password</h2>
        <p className="g-muted" style={{ margin: "0.35rem 0 0", fontSize: "0.84rem" }}>
          Update your login password for {email}.
        </p>
      </div>
      <label>
        <span className="g-form-label">Current password</span>
        <PasswordInput
          required
          className={inputClass}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      <label>
        <span className="g-form-label">New password</span>
        <PasswordInput
          required
          minLength={4}
          className={inputClass}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </label>
      <label>
        <span className="g-form-label">Confirm new password</span>
        <PasswordInput
          required
          minLength={4}
          className={inputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </label>
      <div>
        <button type="submit" className="g-btn-primary" style={{ cursor: "pointer" }} disabled={saving}>
          {saving ? "Updating…" : "Update password"}
        </button>
      </div>
      {success ? <p className="g-alert g-alert-success">{success}</p> : null}
      {error ? <p className="g-alert g-alert-error">{error}</p> : null}
    </form>
  );
}
