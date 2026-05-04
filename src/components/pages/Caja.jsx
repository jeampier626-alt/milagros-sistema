import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { today, fmtDate, fmtMoney } from "@/data/utils.js";
import { SC, Modal, FInput, FSelect, FTextarea, Btn, Empty } from "@/components/ui/UI.jsx";

const CAT_INGRESO = ["Venta", "Alquiler", "Depósito", "Otro Ingreso"];
const CAT_GASTO   = ["Compra de prenda", "Mantenimiento", "Servicios", "Sueldos", "Arriendo", "Otros"];

function MovModal({ tipo, onSave, onClose }) {
  const [f, setF] = useState({ categoria: tipo === "Ingreso" ? CAT_INGRESO[3] : CAT_GASTO[0], descripcion: "", monto: "" });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <Modal title={tipo === "Ingreso" ? "📥 Registrar Ingreso" : "📤 Registrar Gasto"} onClose={onClose} mw={420}>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <FSelect label="Categoría" value={f.categoria} opts={tipo === "Ingreso" ? CAT_INGRESO : CAT_GASTO} onChange={e => s("categoria", e.target.value)} />
        <FInput  label="Descripción" value={f.descripcion} onChange={e => s("descripcion", e.target.value)} placeholder="Detalle del movimiento" />
        <FInput  label={`💵 Monto (S/) *`} type="number" value={f.monto} onChange={e => s("monto", e.target.value)} placeholder="0.00" />
      </div>
      <div className="modal-ft">
        <Btn v={tipo === "Ingreso" ? "success" : "danger"} sz="lg" style={{ flex: 1 }}
          onClick={() => { if (Number(f.monto) > 0 && f.descripcion.trim()) onSave({ ...f, tipo }); }}>
          {tipo === "Ingreso" ? "📥 Registrar Ingreso" : "📤 Registrar Gasto"}
        </Btn>
        <Btn v="ghost" sz="lg" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

export default function Caja() {
  const { caja, currentUser, addMovimiento } = useApp();
  const r = currentUser.role;
  const [modal, setM]   = useState(null);
  const [fechaF, setFF] = useState(today());

  const movs = useMemo(() => [...caja].reverse(), [caja]);

  const hoy     = today();
  const filtDay = movs.filter(m => m.fecha === fechaF);

  const totalIngresos = movs.filter(m => m.tipo === "Ingreso").reduce((a, m) => a + m.monto, 0);
  const totalGastos   = movs.filter(m => m.tipo === "Gasto").reduce((a, m) => a + m.monto, 0);
  const saldo         = totalIngresos - totalGastos;

  const hoyIng = movs.filter(m => m.tipo === "Ingreso" && m.fecha === hoy).reduce((a, m) => a + m.monto, 0);
  const hoyGas = movs.filter(m => m.tipo === "Gasto"   && m.fecha === hoy).reduce((a, m) => a + m.monto, 0);

  const doSave = data => {
    addMovimiento({ ...data, user: currentUser });
    setM(null);
  };

  return (
    <div className="fade-in">
      <div className="ph">
        <h2 className="pt2">💵 Caja</h2>
        {r !== "seller" && (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn v="success" onClick={() => setM("Ingreso")}>📥 Ingreso</Btn>
            <Btn v="danger"  onClick={() => setM("Gasto")}>📤 Gasto</Btn>
          </div>
        )}
      </div>

      {/* Big balance */}
      <div className="caja-summary">
        <div className="caja-big">
          <div className="caja-big-lbl">💰 Saldo Total</div>
          <div className="caja-big-val" style={{ color: saldo >= 0 ? "#fff" : "#fca5a5" }}>{fmtMoney(saldo)}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>📥 Ingresos Totales</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "var(--green2)", marginTop: 4 }}>{fmtMoney(totalIngresos)}</div>
          </div>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>📤 Gastos Totales</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "var(--red2)", marginTop: 4 }}>{fmtMoney(totalGastos)}</div>
          </div>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>📅 Ingresos Hoy</div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "var(--green2)", marginTop: 4 }}>{fmtMoney(hoyIng)}</div>
          </div>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase" }}>📅 Gastos Hoy</div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "var(--red2)", marginTop: 4 }}>{fmtMoney(hoyGas)}</div>
          </div>
        </div>
      </div>

      {/* Movements table */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ color: "var(--text2)", fontSize: 15, margin: 0 }}>📋 Movimientos</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 1 }}>FILTRAR POR DÍA</label>
            <input type="date" className="fi" style={{ width: "auto", padding: "5px 10px" }} value={fechaF} onChange={e => setFF(e.target.value)} />
            <Btn v="ghost" sz="sm" onClick={() => setFF("")}>Ver todos</Btn>
          </div>
        </div>

        {(fechaF ? filtDay : movs).length === 0
          ? <Empty icon="💵" text="Sin movimientos" />
          : <div className="twrap">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>📅 Fecha</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>👤 Usuario</th>
                    <th>💵 Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {(fechaF ? filtDay : movs).map(m => (
                    <tr key={m.id}>
                      <td style={{ color: "var(--text3)", whiteSpace: "nowrap" }}>{fmtDate(m.fecha)}</td>
                      <td>
                        <span style={{ background: m.tipo === "Ingreso" ? "#0a2010" : "#1e0808", border: `1px solid ${m.tipo === "Ingreso" ? "var(--green)" : "var(--red)"}55`, borderRadius: 6, padding: "2px 8px", fontSize: 11, color: m.tipo === "Ingreso" ? "var(--green2)" : "var(--red2)" }}>
                          {m.tipo === "Ingreso" ? "📥" : "📤"} {m.tipo}
                        </span>
                      </td>
                      <td style={{ color: "var(--text3)", fontSize: 12 }}>{m.categoria}</td>
                      <td style={{ color: "var(--text2)" }}>{m.descripcion}</td>
                      <td style={{ fontSize: 11, color: "var(--muted)" }}>{m.userName}</td>
                      <td style={{ fontWeight: "bold", color: m.tipo === "Ingreso" ? "var(--green2)" : "var(--red2)" }}>
                        {m.tipo === "Ingreso" ? "+" : "-"}{fmtMoney(m.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {modal && <MovModal tipo={modal} onSave={doSave} onClose={() => setM(null)} />}
    </div>
  );
}
