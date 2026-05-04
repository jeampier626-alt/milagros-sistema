import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { fmtDate, fmtMoney } from "@/data/utils.js";
import { SC, ItemImg, Empty, TxnBdg, Btn } from "@/components/ui/UI.jsx";
import { VentaModal } from "@/components/modals/TxnModals.jsx";
import { gE } from "@/components/modals/ItemModal.jsx";

export default function Ventas() {
  const {items, historial, currentUser, addVenta} = useApp();
  const r = currentUser.role;
  const [modal, setM] = useState(null);
  const [q, setQ]     = useState("");

  const disponibles = useMemo(()=>items.filter(i=>(i.tipo==="Venta"||i.tipo==="Ambos")&&i.estado==="Disponible"&&(!q||i.nombre.toLowerCase().includes(q.toLowerCase())||i.codigo.toLowerCase().includes(q.toLowerCase()))),[items,q]);

  const ventas = useMemo(()=>{
    let h = historial.filter(x=>x.tipo==="Venta");
    if(r==="seller") h=h.filter(x=>x.sellerId===currentUser.id);
    return [...h].reverse();
  },[historial,currentUser,r]);

  const total   = ventas.reduce((a,v)=>a+v.monto,0);
  const hoy     = new Date().toISOString().split("T")[0];
  const hoyN    = ventas.filter(v=>v.fecha===hoy).length;
  const hoyS    = ventas.filter(v=>v.fecha===hoy).reduce((a,v)=>a+v.monto,0);
  const descTot = ventas.reduce((a,v)=>a+(v.descuento||0),0);

  const doVenta = ({item,cliente,notas,descuento}) => { addVenta({item,cliente,notas,descuento,user:currentUser}); setM(null); };

  return (
    <div className="fade-in">
      <div className="ph"><h2 className="pt2">💰 Ventas</h2></div>
      <div className="sg" style={{marginBottom:20}}>
        <SC icon="💰" val={ventas.length}      lbl="Total Ventas"    color="var(--green2)"/>
        <SC icon="📅" val={hoyN}               lbl="Ventas Hoy"      color="var(--gold2)"/>
        <SC icon="📦" val={disponibles.length} lbl="Para Vender"     color="var(--rose2)"/>
        {r!=="seller"&&<SC icon="💵" val={fmtMoney(total)} lbl="Ingresos"      color="var(--green)"/>}
        {r!=="seller"&&<SC icon="🏷️"  val={fmtMoney(descTot)} lbl="Descuentos" color="var(--yellow2)"/>}
        {r!=="seller"&&<SC icon="🎯" val={fmtMoney(hoyS)}  lbl="Hoy S/"       color="var(--teal2)"/>}
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <h3 style={{color:"var(--text2)",fontSize:15,margin:0}}>🏷️ Prendas disponibles para venta</h3>
          <input className="fi" style={{maxWidth:220}} value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar…"/>
        </div>
        {disponibles.length===0
          ? <Empty icon="🏷️" text="No hay prendas disponibles para venta"/>
          : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:10}}>
              {disponibles.map(item=>(
                <div key={item.id} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:12,padding:14,display:"flex",gap:10,alignItems:"center"}}>
                  <ItemImg src={item.imagen} emoji={gE(item.categoria)} size={52}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:"bold",color:"var(--text2)",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.nombre}</div>
                    <code style={{fontSize:10,color:"var(--rose2)"}}>{item.codigo}</code>
                    <div style={{fontSize:11,color:"var(--text3)"}}>{item.calidad} · {item.talla}</div>
                    <div style={{color:"var(--gold2)",fontWeight:"bold",fontSize:15,marginTop:2}}>{fmtMoney(item.precioVenta)}</div>
                  </div>
                  <Btn v="gold" sz="sm" onClick={()=>setM(item)}>Vender</Btn>
                </div>
              ))}
            </div>
        }
      </div>

      <div className="card">
        <h3 style={{color:"var(--text2)",fontSize:15,margin:"0 0 14px"}}>📜 Historial de Ventas {r==="seller"?"(mis ventas)":""}</h3>
        {ventas.length===0
          ? <Empty icon="📋" text="Sin ventas registradas"/>
          : <div className="twrap">
              <table className="dtable">
                <thead><tr>
                  <th>Fecha</th><th>Prenda</th><th>Cliente</th>
                  {r!=="seller"&&<th>🛍️ Vendedora</th>}
                  <th>💵 Base</th><th>🏷️ Desc.</th><th>💰 Total</th><th>Notas</th>
                </tr></thead>
                <tbody>
                  {ventas.map(v=>(
                    <tr key={v.id}>
                      <td style={{color:"var(--text3)",whiteSpace:"nowrap"}}>{fmtDate(v.fecha)}</td>
                      <td style={{color:"var(--text2)"}}>{v.itemNombre}<br/><code style={{fontSize:10,color:"var(--rose2)"}}>{v.itemCodigo}</code></td>
                      <td style={{color:"var(--text3)"}}>{v.cliente}</td>
                      {r!=="seller"&&<td style={{fontSize:11,color:"var(--green2)"}}>🛍️ {v.sellerName}</td>}
                      <td style={{color:"var(--muted)"}}>{fmtMoney(v.precioBase)}</td>
                      <td>{v.descuento>0?<span className="disc-badge">-{fmtMoney(v.descuento)}</span>:"—"}</td>
                      <td style={{color:"var(--gold2)",fontWeight:"bold"}}>{fmtMoney(v.monto)}</td>
                      <td style={{color:"var(--muted)",fontSize:11}}>{v.notas||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {modal&&<VentaModal item={modal} onSave={doVenta} onClose={()=>setM(null)}/>}
    </div>
  );
}
