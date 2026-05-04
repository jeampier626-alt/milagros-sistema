import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { TXN_META } from "@/data/constants.js";
import { fmtDate, fmtMoney } from "@/data/utils.js";
import { TxnBdg, Empty } from "@/components/ui/UI.jsx";

export default function Historial() {
  const { historial, currentUser } = useApp();
  const r = currentUser.role;
  const [filtro, setF] = useState("Todos");

  const lista = useMemo(() => {
    let h = historial;
    if (r === "seller") h = h.filter(x => x.sellerId === currentUser.id);
    if (filtro !== "Todos") h = h.filter(x => x.tipo === filtro);
    return [...h].reverse();
  }, [historial, currentUser, r, filtro]);

  const totales = useMemo(() => {
    const base = r === "seller" ? historial.filter(h => h.sellerId === currentUser.id) : historial;
    return {
      ventas:     base.filter(h => h.tipo === "Venta").length,
      alquileres: base.filter(h => h.tipo === "Alquiler").length,
      ingresos:   base.filter(h => h.monto > 0).reduce((a, h) => a + h.monto, 0),
      descuentos: base.reduce((a, h) => a + (h.descuento || 0), 0),
    };
  }, [historial, currentUser, r]);

  return (
    <div className="fade-in">
      <div className="ph">
        <h2 className="pt2">📜 Historial {r === "seller" ? "— Mis Transacciones" : "General"}</h2>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Todos", "Venta", "Alquiler", "Devolución"].map(f => (
            <button key={f} onClick={() => setF(f)} style={{ background: filtro === f ? "var(--card2)" : "transparent", border: `1px solid ${filtro === f ? "var(--rose2)" : "var(--border)"}`, borderRadius: 8, padding: "5px 12px", color: filtro === f ? "var(--text2)" : "var(--muted)", fontFamily: "var(--font)", fontSize: 12, cursor: "pointer" }}>
              {TXN_META[f]?.icon || "📋"} {f}
            </button>
          ))}
        </div>
      </div>

      <div className="tcard">
        <div className="twrap">
          <table className="dtable">
            <thead>
              <tr>
                <th>📅 Fecha</th>
                <th>Tipo</th>
                <th>Prenda</th>
                <th>👤 Cliente</th>
                {r !== "seller" && <th>🛍️ Vendedora</th>}
                <th>💵 Base</th>
                <th>🏷️ Desc.</th>
                <th>💰 Total</th>
                <th>📝 Notas</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <tr><td colSpan={r === "seller" ? 8 : 9} className="empty-td">Sin registros</td></tr>}
              {lista.map(h => (
                <tr key={h.id}>
                  <td style={{ color: "var(--text3)", whiteSpace: "nowrap" }}>{fmtDate(h.fecha)}</td>
                  <td><TxnBdg tipo={h.tipo} /></td>
                  <td>
                    <div style={{ color: "var(--text2)" }}>{h.itemNombre}</div>
                    <code style={{ fontSize: 10, color: "var(--rose2)" }}>{h.itemCodigo}</code>
                  </td>
                  <td style={{ color: "var(--text3)" }}>{h.cliente}</td>
                  {r !== "seller" && <td style={{ fontSize: 11, color: "var(--green2)" }}>🛍️ {h.sellerName}</td>}
                  <td style={{ color: "var(--muted)" }}>{h.precioBase > 0 ? fmtMoney(h.precioBase) : "—"}</td>
                  <td>{h.descuento > 0 ? <span className="disc-badge">-{fmtMoney(h.descuento)}</span> : "—"}</td>
                  <td style={{ color: h.monto > 0 ? "var(--gold2)" : "var(--gray)", fontWeight: h.monto > 0 ? "bold" : "normal" }}>
                    {h.monto > 0 ? fmtMoney(h.monto) : "—"}
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 11 }}>{h.notas || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        {[
          ["📋 Transacciones", lista.length,               "var(--rose2)"],
          ["💰 Ventas",        totales.ventas,              "var(--green2)"],
          ["🔄 Alquileres",    totales.alquileres,          "var(--yellow2)"],
          r !== "seller" ? ["💵 Ingresos", fmtMoney(totales.ingresos), "var(--gold2)"] : null,
          totales.descuentos > 0 ? ["🏷️ Descuentos", fmtMoney(totales.descuentos), "var(--yellow)"] : null,
        ].filter(Boolean).map(([k, v, c]) => (
          <div key={k} style={{ background: "var(--card)", border: `1px solid ${c}33`, borderRadius: 10, padding: "10px 18px", flex: 1, minWidth: 130 }}>
            <div style={{ fontSize: 10, color: "var(--muted2)", letterSpacing: 1, textTransform: "uppercase" }}>{k}</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: c, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
