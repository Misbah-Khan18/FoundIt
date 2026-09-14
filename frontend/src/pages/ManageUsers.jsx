import { useState, useMemo } from "react";
import { Users, Search, UserX, CheckCircle2, Shield, User } from "lucide-react";
import { useAdmin } from "../context/AdminContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function ManageUsers() {
  const { users, toggleUserRole, toggleUserStatus } = useAdmin();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => roleFilter === "all" || u.role === roleFilter)
      .filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          (u.phone_number && u.phone_number.includes(query))
      );
  }, [users, query, roleFilter]);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--navy-900)", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
          <Users size={15} /> Access Control &amp; Membership
        </div>
        <h1>User Directory</h1>
        <p>Institutional user management, role escalation, and account status administration for MIT-WPU.</p>
      </div>

      {/* Filter toolbar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "0 0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <Search size={16} color="var(--slate-400)" />
          <input
            className="input"
            style={{ width: "100%" }}
            placeholder="Search by student name, email address, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "student", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                border: "1px solid var(--border-light)",
                background: roleFilter === r ? "var(--navy-900)" : "#ffffff",
                color: roleFilter === r ? "#ffffff" : "var(--slate-600)",
                padding: "6px 14px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.82rem",
                textTransform: "capitalize",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {r === "all" ? "All Users" : r === "student" ? "Students" : "Admins"}
            </button>
          ))}
        </div>
      </div>

      {/* Table view */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users size={32} strokeWidth={2} />}
          title="No Users Found"
          description="No registered user accounts match your current search criteria."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Institutional Email</th>
                <th>Phone Number</th>
                <th>System Role</th>
                <th>Reports Filed</th>
                <th>Account Status</th>
                <th style={{ textAlign: "right" }}>Permission Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isAdminUser = u.role === "admin";
                const isSuspended = u.status === "suspended";

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: isAdminUser ? "rgba(201, 165, 72, 0.18)" : "rgba(30, 54, 116, 0.08)",
                            color: isAdminUser ? "var(--gold-600)" : "var(--navy-900)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}
                        >
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.92rem" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.86rem", color: "var(--slate-600)" }}>{u.email}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--slate-500)" }}>{u.phone_number || "—"}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                          background: isAdminUser ? "rgba(201, 165, 72, 0.18)" : "rgba(30, 54, 116, 0.08)",
                          color: isAdminUser ? "var(--gold-600)" : "var(--navy-900)",
                          textTransform: "uppercase",
                        }}
                      >
                        {isAdminUser ? <Shield size={12} /> : <User size={12} />}
                        {isAdminUser ? "Admin" : "Student"}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.84rem", fontWeight: 600, color: "var(--ink)" }}>{u.reports ?? 0}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          background: isSuspended ? "rgba(210, 31, 43, 0.12)" : "rgba(16, 185, 129, 0.12)",
                          color: isSuspended ? "var(--red-500)" : "var(--emerald-600)",
                        }}
                      >
                        {isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          className="btn btn--outline btn--sm"
                          style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                          onClick={() => toggleUserRole(u.id)}
                        >
                          {isAdminUser ? "Demote" : "Make Admin"}
                        </button>
                        <button
                          className="btn btn--outline btn--sm"
                          style={{
                            padding: "4px 10px",
                            borderColor: isSuspended ? "var(--emerald-600)" : "var(--border-light)",
                            color: isSuspended ? "var(--emerald-600)" : "var(--slate-500)",
                            fontSize: "0.78rem",
                          }}
                          title={isSuspended ? "Activate Account" : "Suspend Account"}
                          onClick={() => toggleUserStatus(u.id)}
                        >
                          {isSuspended ? <CheckCircle2 size={13} /> : <UserX size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

