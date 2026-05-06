import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { today, fmtDate, fmtMoney } from "@/data/utils.js";
import { SC, Modal, FInput, FSelect, Btn, Empty } from "@/components/ui/UI.jsx";

const CAT_ING = ["Venta","Alquiler","Depósito","Otro Ingreso"];
const CAT_GAS = ["Compra de prenda","Mantenimiento","Servicios","Sueldos","Arriendo","Otros"];

function MovModal({ tipo, onSave, onClose }) {
  const [f, setF] = useState({ categoria: tipo==="Ingreso"?CAT_ING[3]:CAT_GAS[0], descripcion:"", monto:"" });
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={tipo==="Ingreso"?"📥 Registrar Ingreso":"📤 Registrar Gasto"} onClose={onClose} mw={420}>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <FSelect label="Categoría" value={f.categoria} opts={tipo==="Ingreso"?CAT_ING:CAT_GAS} onChange={e=>s("categoria",e.target.value)}/>
        <FInput  label="Descripción" value={f.descripcion} onChange={e=>s("descripcion",e.target.value)} placeholder="Detalle del movimiento"/>
        <FInput  label="Monto (S/) *" type="number" value={f.monto} onChange={e=>s("monto",e.target.value)} placeholder="0.00"/>
      </div>
      <div className="modal-ft">
        <Btn v={tipo==="Ingreso"?"success":"danger"} sz="lg" style={{flex:1}}
          onClick={()=>{if(Number(f.monto)>0&&f.descripcion.trim())onSave({...f,tipo});}}>
          {tipo==="Ingreso"?"📥 Registrar Ingreso":"📤 Registrar Gasto"}
        </Btn>
        <Btn v="ghost" sz="lg" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function Caja() {
  const { caja, currentUser, addMovimiento } = useApp();
  const r = currentUser.role;
  const canManage = r==="owner"||r==="admin";
  const [modal, setM]    = useState(null);
  const [vista, setV]    = useState("dia"); // dia | mes | todo
  const [diaF, setDia]   = useState(today());
  const [mesF, setMes]   = useState(today().slice(0,7)); // YYYY-MM

  // Only non-cancelled movements count for totals
  const movs = useMemo(()=>[...caja].filter(m=>!m.cancelado).reverse(),[caja]);

  const filtrados = useMemo(()=>{
    if(vista==="dia")  return movs.filter(m=>m.fecha===diaF);
    if(vista==="mes")  return movs.filter(m=>m.fecha?.startsWith(mesF));
    return movs;
  },[movs,vista,diaF,mesF]);

  const sum = (arr,tipo) => arr.filter(m=>m.tipo===tipo).reduce((a,m)=>a+m.monto,0);

  const ingTotal = sum(filtrados,"Ingreso");
  const gasTotal = sum(filtrados,"Gasto");
  const saldoF   = ingTotal - gasTotal;

  const ingGlobal = sum(movs,"Ingreso");
  const gasGlobal = sum(movs,"Gasto");
  const saldoG    = ingGlobal - gasGlobal;

  // Current month label
  const [yy,mm] = mesF.split("-");
  const mesLabel = `${MESES[parseInt(mm)-1]} ${yy}`;

  const doSave = data => { addMovimiento({...data, user:currentUser}); setM(null); };

  const periodoLabel = vista==="dia" ? `📅 ${fmtDate(diaF)}` : vista==="mes" ? `📆 ${mesLabel}` : "📋 Todos los movimientos";

  return (
    <div className="fade-in">
      <div className="ph">
        <h2 className="pt2">💵 Caja</h2>
        {canManage && (
          <div style={{display:"flex",gap:8}}>
            <Btn v="success" onClick={()=>setM("Ingreso")}>📥 Ingreso</Btn>
            <Btn v="danger"  onClick={()=>setM("Gasto")}>📤 Gasto</Btn>
          </div>
        )}
      </div>

      {/* Global balance */}
      <div className="caja-summary" style={{marginBottom:20}}>
        <div className="caja-big">
          <div className="caja-big-lbl">💰 Saldo Total</div>
          <div className="caja-big-val" style={{color:saldoG>=0?"#fff":"#fca5a5"}}>{fmtMoney(saldoG)}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="card" style={{padding:"14px 16px"}}>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>📥 Ingresos Totales</div>
            <div style={{fontSize:20,fontWeight:"bold",color:"var(--green2)",marginTop:4}}>{fmtMoney(ingGlobal)}</div>
          </div>
          <div className="card" style={{padding:"14px 16px"}}>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>📤 Gastos Totales</div>
            <div style={{fontSize:20,fontWeight:"bold",color:"var(--red2)",marginTop:4}}>{fmtMoney(gasGlobal)}</div>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {[["dia","📅 Día"],["mes","📆 Mes"],["todo","📋 Todo"]].map(([k,l])=>(
            <button key={k} onClick={()=>setV(k)} style={{background:vista===k?"var(--rose2)":"var(--card2)",border:`1px solid ${vista===k?"var(--rose2)":"var(--border)"}`,borderRadius:8,padding:"6px 16px",color:"#fff",fontFamily:"var(--font)",fontSize:12,cursor:"pointer"}}>
              {l}
            </button>
          ))}
          {vista==="dia" && (
            <input type="date" className="fi" style={{width:"auto",padding:"5px 10px"}} value={diaF} onChange={e=>setDia(e.target.value)}/>
          )}
          {vista==="mes" && (
            <input type="month" className="fi" style={{width:"auto",padding:"5px 10px"}} value={mesF} onChange={e=>setMes(e.target.value)}/>
          )}
        </div>

        {/* Period summary */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:14}}>
          <div style={{background:"#0a2010",border:"1px solid var(--green)55",borderRadius:10,padding:"10px 14px"}}>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>📥 Ingresos</div>
            <div style={{fontSize:18,fontWeight:"bold",color:"var(--green2)",marginTop:3}}>{fmtMoney(ingTotal)}</div>
          </div>
          <div style={{background:"#1e0808",border:"1px solid var(--red)55",borderRadius:10,padding:"10px 14px"}}>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>📤 Gastos</div>
            <div style={{fontSize:18,fontWeight:"bold",color:"var(--red2)",marginTop:3}}>{fmtMoney(gasTotal)}</div>
          </div>
          <div style={{background:saldoF>=0?"#0a2010":"#1e0808",border:`1px solid ${saldoF>=0?"var(--green)":"var(--red)"}55`,borderRadius:10,padding:"10px 14px"}}>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>💰 Saldo</div>
            <div style={{fontSize:18,fontWeight:"bold",color:saldoF>=0?"var(--gold2)":"var(--red2)",marginTop:3}}>{fmtMoney(saldoF)}</div>
          </div>
          <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px"}}>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>📋 Movimientos</div>
            <div style={{fontSize:18,fontWeight:"bold",color:"var(--text2)",marginTop:3}}>{filtrados.length}</div>
          </div>
        </div>

        <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>{periodoLabel} · {filtrados.length} movimiento{filtrados.length!==1?"s":""}</div>

        {filtrados.length===0
          ? <Empty icon="💵" text="Sin movimientos en este período"/>
          : <div className="twrap">
              <table className="dtable">
                <thead>
                  <tr><th>📅 Fecha</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>👤 Usuario</th><th>💵 Monto</th></tr>
                </thead>
                <tbody>
                  {filtrados.map(m=>(
                    <tr key={m.id}>
                      <td style={{color:"var(--text3)",whiteSpace:"nowrap"}}>{fmtDate(m.fecha)}</td>
                      <td>
                        <span style={{background:m.tipo==="Ingreso"?"#0a2010":"#1e0808",border:`1px solid ${m.tipo==="Ingreso"?"var(--green)":"var(--red)"}55`,borderRadius:6,padding:"2px 8px",fontSize:11,color:m.tipo==="Ingreso"?"var(--green2)":"var(--red2)"}}>
                          {m.tipo==="Ingreso"?"📥":"📤"} {m.tipo}
                        </span>
                      </td>
                      <td style={{color:"var(--text3)",fontSize:12}}>{m.categoria}</td>
                      <td style={{color:"var(--text2)"}}>{m.descripcion}</td>
                      <td style={{fontSize:11,color:"var(--muted)"}}>{m.userName}</td>
                      <td style={{fontWeight:"bold",color:m.tipo==="Ingreso"?"var(--green2)":"var(--red2)"}}>
                        {m.tipo==="Ingreso"?"+":"-"}{fmtMoney(m.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {modal && <MovModal tipo={modal} onSave={doSave} onClose={()=>setM(null)}/>}
    </div>
  );
}
