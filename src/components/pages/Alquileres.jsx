import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { today, fmtDate, fmtMoney, diffDays } from "@/data/utils.js";
import { SC, ItemImg, Empty, Btn } from "@/components/ui/UI.jsx";
import { AlquilerModal } from "@/components/modals/TxnModals.jsx";
import { gE } from "@/components/modals/ItemModal.jsx";

export default function Alquileres() {
  const {items, alquileres, currentUser, addAlquiler, devolverAlquiler} = useApp();
  const [modal, setM]  = useState(false);
  const [filtro, setF] = useState("Activo");

  const lista = useMemo(()=>[...alquileres].filter(a=>filtro==="Todos"||a.estado===filtro).reverse(),[alquileres,filtro]);
  const activos  = alquileres.filter(a=>a.estado==="Activo").length;
  const vencidos = alquileres.filter(a=>a.estado==="Activo"&&a.fechaDevolucion<today()).length;
  const ingresos = alquileres.reduce((s,a)=>s+a.montoTotal,0);
  const descTot  = alquileres.reduce((s,a)=>s+(a.descuento||0),0);

  const doAlq = (form,item) => { addAlquiler({form,item,user:currentUser}); setM(false); };
  const doDevolver = alq => {
    const item = items.find(i=>i.id===alq.itemId);
    if(window.confirm(`¿Registrar devolución de "${item?.nombre}"?`)) devolverAlquiler({alq,item,user:currentUser});
  };

  return (
    <div className="fade-in">
      <div className="ph">
        <h2 className="pt2">🔄 Alquileres</h2>
        <Btn v="rose" onClick={()=>setM(true)}>➕ Nuevo Alquiler</Btn>
      </div>

      <div className="sg" style={{marginBottom:18}}>
        <SC icon="🔄" val={activos}  lbl="Activos"      color="var(--yellow2)"/>
        <SC icon="⚠️" val={vencidos} lbl="Vencidos"     color={vencidos>0?"var(--red2)":"var(--gray2)"}/>
        <SC icon="✅" val={alquileres.filter(a=>a.estado==="Devuelto").length} lbl="Devueltos" color="var(--green2)"/>
        <SC icon="💵" val={fmtMoney(ingresos)} lbl="Ingresos"   color="var(--gold2)"/>
        {descTot>0&&<SC icon="🏷️" val={fmtMoney(descTot)} lbl="Descuentos" color="var(--yellow2)"/>}
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["Activo","🔄 Activos"],["Devuelto","✅ Devueltos"],["Todos","📋 Todos"]].map(([k,l])=>(
          <button key={k} onClick={()=>setF(k)} style={{background:filtro===k?"var(--card2)":"transparent",border:`1px solid ${filtro===k?"var(--rose2)":"var(--border)"}`,borderRadius:8,padding:"5px 14px",color:filtro===k?"var(--text2)":"var(--muted)",fontFamily:"var(--font)",fontSize:12,cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {lista.length===0
        ? <Empty icon="🔄" text="No hay alquileres en esta categoría"/>
        : <div style={{display:"grid",gap:12}}>
            {lista.map(alq=>{
              const item    = items.find(i=>i.id===alq.itemId);
              const vencido = alq.estado==="Activo"&&alq.fechaDevolucion<today();
              const dias    = alq.estado==="Activo"?diffDays(today(),alq.fechaDevolucion):null;
              const dc      = dias===null?"var(--gray)":dias<0?"var(--red2)":dias<=1?"var(--yellow2)":"var(--green2)";
              const dt      = dias===null?null:dias<0?`⚠️ ${Math.abs(dias)}d vencido`:`${dias}d restante${dias!==1?"s":""}`;
              return (
                <div key={alq.id} style={{background:"linear-gradient(135deg,var(--card),var(--card2))",border:`1px solid ${vencido?"rgba(251,191,36,.4)":"var(--border)"}`,borderRadius:14,padding:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:12}}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <ItemImg src={item?.imagen} emoji={gE(item?.categoria||"Otro")} size={48}/>
                      <div>
                        <div style={{fontWeight:"bold",color:"var(--text2)",fontSize:14}}>{item?.nombre||"Prenda eliminada"}</div>
                        <code style={{fontSize:10,color:"var(--rose2)"}}>{item?.codigo}</code>
                        <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>👤 {alq.cliente}{alq.dni?` · 🪪 ${alq.dni}`:""}{alq.telefono?` · 📞 ${alq.telefono}`:""}</div>
                        <div style={{fontSize:11,color:"var(--green2)",marginTop:1}}>🛍️ {alq.sellerName}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{background:alq.estado==="Devuelto"?"#0a2010":vencido?"#1e1000":"#0a1428",border:`1px solid ${alq.estado==="Devuelto"?"var(--green)":vencido?"var(--yellow)":"var(--blue)"}55`,borderRadius:6,padding:"3px 10px",fontSize:11,color:alq.estado==="Devuelto"?"var(--green2)":vencido?"var(--yellow2)":"var(--blue2)"}}>
                        {alq.estado==="Devuelto"?"✅ Devuelto":vencido?"⚠️ Vencido":"🔄 Activo"}
                      </span>
                      {alq.estado==="Activo"&&<Btn v="success" sz="sm" onClick={()=>doDevolver(alq)}>↩️ Devolución</Btn>}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(115px,1fr))",gap:7}}>
                    {[["📅 Inicio",fmtDate(alq.fechaInicio)],["📅 Devolución",fmtDate(alq.fechaDevolucion)],alq.estado==="Activo"?["⏳ Estado",dt]:["📅 Devuelto",fmtDate(alq.fechaDevolucionReal)],["💰 Total",fmtMoney(alq.montoTotal)],alq.descuento>0?["🏷️ Descuento",fmtMoney(alq.descuento)]:null,["🔒 Depósito",alq.deposito?fmtMoney(alq.deposito):"—"]].filter(Boolean).map(([k,v])=>(
                      <div className="mcard" key={k} style={{background:"var(--bg2)"}}>
                        <div className="mlabel">{k}</div>
                        <div style={{fontSize:12,color:k==="⏳ Estado"?dc:"var(--text2)"}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {alq.notas&&<p style={{marginTop:8,fontSize:11,color:"var(--muted)"}}>📝 {alq.notas}</p>}
                </div>
              );
            })}
          </div>
      }
      {modal&&<AlquilerModal items={items} preItem={null} onSave={doAlq} onClose={()=>setM(false)}/>}
    </div>
  );
}
