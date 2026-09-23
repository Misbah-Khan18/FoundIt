import { useState, useMemo, useEffect } from "react";
import { Users, Search, UserX, CheckCircle2, Shield, User } from "lucide-react";
import { useAdmin } from "../context/AdminContext.jsx";
import EmptyState from "../components/EmptyState.jsx";
import AdminSyncBadge from "../components/admin/AdminSyncBadge.jsx";
import "./ManageUsers.css";

export default function ManageUsers() {
  const { users, toggleUserRole, toggleUserStatus, refreshAdminData } = useAdmin();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => roleFilter === "all" || u.role === roleFilter)
      .filter((u) => statusFilter === "all" || (u.status || "active") === statusFilter)
      .filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(query.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(query.toLowerCase())) ||
          (u.phone_number && u.phone_number.includes(query)) ||
          (u.roll_number && u.roll_number.toLowerCase().includes(query.toLowerCase()))
      );
  }, [users, query, roleFilter, statusFilter]);

  return (
    <div className="user-dir-container">
      {/* Top Banner / Sync Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          <Users size={15} /> Access Control &amp; Membership
        </div>
        <AdminSyncBadge />
      </div>

      {/* Main Clean White Card (Matching Reference Design) */}
      <div className="user-dir-card">
        {/* Card Header Toolbar */}
        <div className="user-dir-card__header">
          <div className="user-dir-card__title-group">
            <h2 className="user-dir-card__title">User Directory</h2>
            <span className="user-dir-card__count">
              ({filteredUsers.length} {filteredUsers.length === 1 ? "member" : "members"})
            </span>
          </div>

          <div className="user-dir-card__controls">
            {/* Search Bar with Icon */}
            <div className="user-dir-search">
              <Search size={14} className="user-dir-search__icon" />
              <input
                type="text"
                className="user-dir-search__input"
                placeholder="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Role Filter Dropdown */}
            <select
              className="user-dir-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            {/* Status Filter Dropdown */}
            <select
              className="user-dir-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users size={32} strokeWidth={2} />}
            title="No Users Found"
            description="No accounts match your current search and filter criteria."
          />
        ) : (
          <div className="user-dir-table-wrap">
            <table className="user-dir-table">
              <thead>
                <tr>
                  <th style={{ width: "12%" }}>User ID</th>
                  <th style={{ width: "24%" }}>Customer Name</th>
                  <th style={{ width: "16%" }}>Role</th>
                  <th style={{ width: "22%" }}>Location</th>
                  <th style={{ width: "12%" }}>Status</th>
                  <th style={{ width: "14%", textAlign: "right" }}>Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isAdminUser = u.role === "admin";
                  const isSuspended = u.status === "suspended";
                  const formattedId = `#${String(u.id).padStart(5, "0")}`;
                  const initials = u.name
                    ? u.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "U";

                  return (
                    <tr key={u.id}>
                      {/* Column 1: User ID */}
                      <td>
                        <span className="user-dir-id">{formattedId}</span>
                      </td>

                      {/* Column 2: Member Name + Avatar */}
                      <td>
                        <div className="user-dir-member">
                          <div
                            className={`user-dir-avatar ${
                              isAdminUser ? "user-dir-avatar--admin" : "user-dir-avatar--student"
                            }`}
                          >
                            {u.profile_image ? (
                              <img src={u.profile_image} alt={u.name} />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <div className="user-dir-name">{u.name || "Unnamed User"}</div>
                            {u.roll_number && (
                              <div className="user-dir-prn">
                                {u.roll_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Role / Stream */}
                      <td>
                        <div className="user-dir-role-text">
                          {isAdminUser ? "Admin" : "Student"}
                        </div>
                        {u.stream && (
                          <div className="user-dir-stream-text">{u.stream}</div>
                        )}
                      </td>

                      {/* Column 4: Location / Institutional Email */}
                      <td>
                        <div className="user-dir-email">{u.email}</div>
                      </td>

                      {/* Column 5: Status (Dot + Text matching reference image) */}
                      <td>
                        <span
                          className={`user-dir-status ${
                            isSuspended ? "user-dir-status--suspended" : "user-dir-status--active"
                          }`}
                        >
                          <span className="user-dir-status__dot" />
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>

                      {/* Column 6: Contact & Management Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="user-dir-actions-cell">
                          <span className="user-dir-phone">{u.phone_number || "—"}</span>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              className="user-dir-btn user-dir-btn--role"
                              title={isAdminUser ? "Demote to student" : "Promote to administrator"}
                              onClick={() => toggleUserRole(u.id)}
                            >
                              {isAdminUser ? <User size={12} /> : <Shield size={12} />}
                              <span>{isAdminUser ? "Demote" : "Admin"}</span>
                            </button>

                            <button
                              className={`user-dir-btn ${
                                isSuspended ? "user-dir-btn--activate" : "user-dir-btn--suspend"
                              }`}
                              title={isSuspended ? "Activate account" : "Suspend account"}
                              onClick={() => toggleUserStatus(u.id)}
                            >
                              {isSuspended ? <CheckCircle2 size={12} /> : <UserX size={12} />}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer Summary */}
            <div className="user-dir-card__footer">
              <span>Showing 1 to {filteredUsers.length} of {users.length} registered members</span>
              <span>MIT World Peace University Institutional Directory</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
