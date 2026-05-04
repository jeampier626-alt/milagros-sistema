import { useState } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { ROLES } from "@/data/constants.js";
import { Modal, Btn, FInput, FSelect, RoleBdg, Avatar } from "@/components/ui/UI.jsx";

function UserModal({ initial, onSave, onClose }) {
  const isNew = !initial?.id;
  const [f, setF] = useState(initial || { name: "", username: "", password: "", role: "seller", active: true });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={isNew ? "➕ Nuevo Usuario" : "✏️ Editar Usuario"} onClose={onClose} mw={460}>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <FInput  label="👤 Nombre completo"   value={f.name}     onChange={e => s("name",     e.target.value)} />
        <FInput  label="🔑 Nombre de usuario" value={f.username} onChange={e => s("username", e.target.value)} />
        <FInput  label="🔒 Contraseña"        value={f.password} onChange={e => s("password", e.target.value)} type="text" />
        <FSelect label="🎭 Rol" value={f.role} onChange={e => s("role", e.target.value)}
          opts={Object.values(ROLES).map(r => ({ v: r.key, l: `${r.icon} ${r.label}` }))} />
        <FSelect label="Estado" value={f.active ? "1" : "0"} onChange={e => s("active", e.target.value === "1")}
          opts={[{ v: "1", l: "✅ Activo" }, { v: "0", l: "❌ Inactivo" }]} />
      </div>
      <div className="modal-ft">
        <Btn v="rose" sz="lg" style={{ flex: 1 }}
          onClick={() => { if (f.name && f.username && f.password) onSave(f); }}>
          {isNew ? "✅ Crear Usuario" : "💾 Guardar"}
        </Btn>
        <Btn v="ghost" sz="lg" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

export default function Ajustes() {
  const { users, currentUser, categories, addUser, updateUser, deleteUser, addCat, delCat, renCat } = useApp();
  const isOwner = currentUser.role === "owner";
  const isAdmin = currentUser.role === "admin" || isOwner;

  const [userMod, setUM] = useState(null);
  const [newCat,  setNC] = useState("");
  const [editCat, setEC] = useState(null);
  const [editVal, setEV] = useState("");

  const saveUser = f => { if (userMod === "new") addUser(f); else updateUser({ ...f, id: userMod.id }); setUM(null); };
  const doAddCat = () => { const t = newCat.trim(); if (t && !categories.includes(t)) { addCat(t); setNC(""); } };
  const doRenCat = () => { const t = editVal.trim(); if (t && !categories.includes(t)) { renCat(editCat, t); setEC(null); } };

  return (
    <div className="fade-in">
      <div className="ph"><h2 className="pt2">⚙️ Configuración</h2></div>

      <div className="sg2">

        {/* Users */}
        <div className="scard" style={{ gridColumn: isOwner ? "1/-1" : "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="scard-title" style={{ margin: 0 }}>👥 Usuarios del Sistema</h3>
            {isOwner && <Btn v="rose" sz="sm" onClick={() => setUM("new")}>➕ Nuevo Usuario</Btn>}
          </div>
          {users.map(u => (
            <div className="user-row" key={u.id}>
              <Avatar name={u.name} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--text2)", fontSize: 13, fontWeight: "bold" }}>{u.name}</div>
                <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
                  <code style={{ fontSize: 10, color: "var(--muted)" }}>@{u.username}</code>
                  <RoleBdg role={u.role} />
                  {!u.active && (
                    <span style={{ background: "#1e0808", border: "1px solid #dc262655", borderRadius: 6, padding: "2px 8px", fontSize: 10, color: "var(--red2)" }}>
                      ❌ Inactivo
                    </span>
                  )}
                </div>
              </div>
              {isOwner && u.id !== currentUser.id && (
                <div style={{ display: "flex", gap: 5 }}>
                  <Btn v="ghost"  sz="xs" onClick={() => setUM(u)}>✏️</Btn>
                  <Btn v="danger" sz="xs" onClick={() => { if (window.confirm(`¿Eliminar a "${u.name}"?`)) deleteUser(u.id); }}>🗑</Btn>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Categories */}
        {isAdmin && (
          <div className="scard">
            <h3 className="scard-title">🏷️ Categorías de Prendas</h3>
            <div style={{ marginBottom: 12 }}>
              {categories.map(cat => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0", borderBottom: "1px solid rgba(61,26,90,.25)" }}>
                  {editCat === cat ? (
                    <>
                      <input className="fi" value={editVal} onChange={e => setEV(e.target.value)}
                        style={{ flex: 1, padding: "5px 9px" }}
                        onKeyDown={e => e.key === "Enter" && doRenCat()} />
                      <Btn v="success" sz="xs" onClick={doRenCat}>✓</Btn>
                      <Btn v="ghost"   sz="xs" onClick={() => setEC(null)}>✕</Btn>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 13, color: "var(--text3)" }}>{cat}</span>
                      <Btn v="ghost"  sz="xs" onClick={() => { setEC(cat); setEV(cat); }}>✏️</Btn>
                      <Btn v="danger" sz="xs" disabled={categories.length <= 1}
                        onClick={() => { if (window.confirm(`¿Eliminar categoría "${cat}"?`)) delCat(cat); }}>🗑</Btn>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input className="fi" value={newCat} onChange={e => setNC(e.target.value)}
                placeholder="Nueva categoría…"
                onKeyDown={e => e.key === "Enter" && doAddCat()}
                style={{ flex: 1 }} />
              <Btn v="rose" sz="sm" onClick={doAddCat}>➕</Btn>
            </div>
          </div>
        )}

        {/* System info */}
        <div className="scard">
          <h3 className="scard-title">💍 Información del Sistema</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["🏪 Negocio",     "Casa de Novias Milagros"],
              ["📦 Versión",     "1.0.0"],
              ["🛠️ Plataforma",  "React + Vite + PWA"],
              ["📱 PWA",         "Instalable en celular"],
              ["👑 Propietaria", "Milagros Flores"],
            ].map(([k, v]) => (
              <div className="mcard" key={k}>
                <div className="mlabel">{k}</div>
                <div className="mval">{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, background: "var(--bg3)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "var(--muted)" }}>
            💡 Los datos se guardan en memoria durante la sesión. Para persistencia permanente conecta Supabase o Firebase (ambos gratuitos).
          </div>
        </div>

      </div>

      {userMod && (
        <UserModal
          initial={userMod === "new" ? null : userMod}
          onSave={saveUser}
          onClose={() => setUM(null)}
        />
      )}
    </div>
  );
}
