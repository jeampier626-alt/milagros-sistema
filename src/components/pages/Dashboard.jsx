import { useMemo } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { ESTADOS, ESTADO_META } from "@/data/constants.js";
import { today, fmtDate, fmtMoney, diffDays } from "@/data/utils.js";
import { SC, Prog } from "@/components/ui/UI.jsx";
import { gE } from "@/components/modals/ItemModal.jsx";

export default function Dashboard() {
  const { items, alquileres, historial, caja, users, categories } = useApp();

  const s = useMemo(() => {
    const hoy          = today();
    const total        = items.length;
    const disponibles  = items.filter(i => i.estado === "Disponible").length;
    const alqActivos   = alquileres.filter(a => a.estado === "Activo").length;
    const vendidos     = items.filter(i => i.estado === "Vendido").length;
    const vencidos     = alquileres.filter(a => a.estado === "Activo" && a.fechaDevolucion < hoy).length;
    const ingresos     = caja.filter(m => m.tipo === "Ingreso").reduce((a, m) => a + m.monto, 0);
    const gastos       = caja.filter(m => m.tipo === "Gasto").reduce((a, m) => a + m.monto, 0);
    const saldo        = ingresos - gastos;
    const hoyIngresos  = caja.filter(m => m.tipo === "Ingreso" && m.fecha === hoy).reduce((a, m) => a + m.monto, 0);
    const descTotales  = historial.reduce((a, h) => a + (h.descuento || 0), 0);
    const porCat       = categories.map(cat => ({ cat, count: items.filter(i => i.categoria === cat).length })).filter(x => x.count > 0);
    const porVendedora = users.filter(u => u.role === "seller" && u.active).map(u => ({
      name:     u.name,
      ventas:   historial.filter(h => h.tipo === "Venta"    && h.sellerId === u.id).length,
      alq:      historial.filter(h => h.tipo === "Alquiler" && h.sellerId === u.id).length,
      ingresos: historial.filter(h => h.monto > 0           && h.sellerId === u.id).reduce((a, h) => a + h.monto, 0),
    }));
    return { total, disponibles, alqActivos, vendidos, vencidos, ingresos, gastos, saldo, hoyIngresos, descTotales, porCat, porVendedora };
  }, [items, alquileres, historial, caja, users, categories]);

  const activos = alquileres.filter(a => a.estado === "Activo");

  return (
    <div className="fade-in">
      <div className="ph"><h2 className="pt2">📊 Resumen General</h2></div>

      {/* KPIs */}
      <div className="sg" style={{ marginBottom: 20 }}>
        <SC icon="📦" val={s.total}              lbl="Total Prendas"    color="var(--rose2)" />
        <SC icon="✅" val={s.disponibles}         lbl="Disponibles"      color="var(--green2)" />
        <SC icon="🔄" val={s.alqActivos}          lbl="Alquilados"       color="var(--yellow2)" />
        <SC icon="💰" val={s.vendidos}            lbl="Vendidos"         color="var(--gray2)" />
        <SC icon="💵" val={fmtMoney(s.saldo)}     lbl="Saldo Caja"       color={s.saldo >= 0 ? "var(--green2)" : "var(--red2)"} />
        <SC icon="📅" val={fmtMoney(s.hoyIngresos)} lbl="Ingresos Hoy"   color="var(--gold2)" />
        <SC icon="⚠️" val={s.vencidos}            lbl="Alq. Vencidos"    color={s.vencidos > 0 ? "var(--red2)" : "var(--gray2)"} />
        <SC icon="🏷️"  val={fmtMoney(s.descTotales)} lbl="Descuentos"   color="var(--yellow2)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>

        {/* By category */}
        <div className="card">
          <h3 style={{ color: "var(--text2)", fontSize: 14, margin: "0 0 14px" }}>📦 Por Categoría</h3>
          {s.porCat.length === 0
            ? <p style={{ color: "var(--muted2)", fontSize: 13 }}>Sin datos</p>
            : s.porCat.map(({ cat, count }) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 12 }}>
                  <span style={{ color: "var(--text3)" }}>{gE(cat)} {cat}</span>
                  <span style={{ color: "var(--rose2)", fontWeight: "bold" }}>{count}</span>
                </div>
                <Prog pct={s.total > 0 ? (count / s.total) * 100 : 0} />
              </div>
            ))
          }
        </div>

        {/* By state */}
        <div className="card">
          <h3 style={{ color: "var(--text2)", fontSize: 14, margin: "0 0 14px" }}>📌 Por Estado</h3>
          {ESTADOS.map(est => {
            const count = items.filter(i => i.estado === est).length;
            const meta  = ESTADO_META[est];
            return (
              <div key={est} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 12 }}>
                  <span style={{ color: meta.color }}>{meta.icon} {est}</span>
                  <span style={{ color: meta.color, fontWeight: "bold" }}>{count}</span>
                </div>
                <Prog pct={s.total > 0 ? (count / s.total) * 100 : 0} color={meta.color} />
              </div>
            );
          })}
        </div>

        {/* Sellers performance */}
        {s.porVendedora.length > 0 && (
          <div className="card">
            <h3 style={{ color: "var(--text2)", fontSize: 14, margin: "0 0 14px" }}>🛍️ Vendedoras</h3>
            {s.porVendedora.map(v => (
              <div key={v.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(61,26,90,.3)" }}>
                <span style={{ fontSize: 13, color: "var(--text3)" }}>🛍️ {v.name}</span>
                <div style={{ display: "flex", gap: 12, fontSize: 11, flexWrap: "wrap" }}>
                  <span style={{ color: "var(--green2)" }}>💰 {v.ventas}v</span>
                  <span style={{ color: "var(--yellow2)" }}>🔄 {v.alq}a</span>
                  <span style={{ color: "var(--gold2)", fontWeight: "bold" }}>{fmtMoney(v.ingresos)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Caja summary */}
        <div className="card">
          <h3 style={{ color: "var(--text2)", fontSize: 14, margin: "0 0 14px" }}>💵 Resumen de Caja</h3>
          {[
            ["📥 Ingresos totales", fmtMoney(s.ingresos),  "var(--green2)"],
            ["📤 Gastos totales",   fmtMoney(s.gastos),    "var(--red2)"],
            ["💰 Saldo neto",       fmtMoney(s.saldo),     s.saldo >= 0 ? "var(--gold2)" : "var(--red2)"],
            ["🏷️ Descuentos dados", fmtMoney(s.descTotales), "var(--yellow2)"],
          ].map(([k, v, c]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(61,26,90,.3)", fontSize: 13 }}>
              <span style={{ color: "var(--text3)" }}>{k}</span>
              <span style={{ color: c, fontWeight: "bold" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Active rentals */}
        {activos.length > 0 && (
          <div className="card" style={{ gridColumn: "1/-1" }}>
            <h3 style={{ color: "var(--text2)", fontSize: 14, margin: "0 0 14px" }}>🔄 Alquileres Activos ({activos.length})</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {activos.map(alq => {
                const item    = items.find(i => i.id === alq.itemId);
                const vencido = alq.fechaDevolucion < today();
                const dias    = diffDays(today(), alq.fechaDevolucion);
                return (
                  <div key={alq.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg2)", borderRadius: 9, padding: "10px 14px", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <span style={{ color: "var(--text2)", fontSize: 13 }}>{item?.nombre}</span>
                      <span style={{ color: "var(--muted)", fontSize: 11, marginLeft: 8 }}>· {alq.cliente}</span>
                      <span style={{ color: "var(--green2)", fontSize: 11, marginLeft: 8 }}>· 🛍️ {alq.sellerName}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{fmtDate(alq.fechaDevolucion)}</span>
                      <span style={{ fontSize: 12, fontWeight: "bold", color: vencido ? "var(--red2)" : dias <= 1 ? "var(--yellow2)" : "var(--green2)" }}>
                        {vencido ? `⚠️ ${Math.abs(dias)}d vencido` : `${dias}d restante${dias !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
