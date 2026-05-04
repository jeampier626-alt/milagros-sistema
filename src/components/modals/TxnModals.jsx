import { useState } from "react";
import { Modal, Btn, FInput, FSelect, FTextarea } from "@/components/ui/UI.jsx";
import { today, addDays, diffDays, fmtMoney, applyDisc } from "@/data/utils.js";

/* ── Alquiler ─────────────────────────────────────────────────────────── */
export function AlquilerModal({items, preItem, onSave, onClose}) {
  const [f, setF] = useState({
    itemId:    preItem?.id||"",
    cliente:"", dni:"", telefono:"",
    fechaInicio: today(), fechaDevolucion: addDays(today(),3),
    precioBase:  preItem?.precioAlquiler||0,
    descuento:   "",
    montoTotal:  preItem?.precioAlquiler||"",
    deposito:"", notas:""
  });
  const s = (k,v) => setF(p=>({...p,[k]:v}));

  const onItemChange = e => {
    const it = items.find(i=>i.id===Number(e.target.value));
    setF(p=>({...p, itemId:Number(e.target.value), precioBase:it?.precioAlquiler||0, descuento:"", montoTotal:it?.precioAlquiler||""}));
  };
  const onDiscChange = v => {
    const d = Number(v)||0;
    s("descuento",v);
    if(f.precioBase) s("montoTotal", Math.max(0,f.precioBase-d));
  };

  const disponibles = items.filter(i=>i.estado==="Disponible"&&(i.tipo==="Alquiler"||i.tipo==="Ambos"));
  const dur = f.fechaInicio&&f.fechaDevolucion ? diffDays(f.fechaInicio,f.fechaDevolucion) : 0;
  const item = items.find(i=>i.id===Number(f.itemId));

  return (
    <Modal title="🔄 Registrar Alquiler" onClose={onClose} mw={580}>
      <div className="fg">
        <div className="full">
          <FSelect label="👗 Prenda *" value={f.itemId} onChange={onItemChange}
            placeholder="Seleccionar prenda disponible…"
            opts={disponibles.map(i=>({v:i.id,l:`${i.nombre} (${i.codigo}) — ${fmtMoney(i.precioAlquiler)}`}))}/>
        </div>
        <div className="full"><FInput label="👤 Cliente *" value={f.cliente} onChange={e=>s("cliente",e.target.value)} placeholder="Nombre completo"/></div>
        <FInput label="🪪 DNI"      value={f.dni}      onChange={e=>s("dni",e.target.value)}/>
        <FInput label="📞 Teléfono" value={f.telefono} onChange={e=>s("telefono",e.target.value)}/>
        <FInput label="📅 Fecha Inicio"     type="date" value={f.fechaInicio}     onChange={e=>s("fechaInicio",e.target.value)}/>
        <FInput label="📅 Fecha Devolución" type="date" value={f.fechaDevolucion} onChange={e=>s("fechaDevolucion",e.target.value)}/>
        <FInput label="💵 Precio Base (S/)" type="number" value={f.precioBase} readOnly style={{color:"var(--muted)"}}/>
        <FInput label="🏷️ Descuento (S/)"   type="number" value={f.descuento}  onChange={e=>onDiscChange(e.target.value)} placeholder="0"/>
        <FInput label="💰 Monto Total (S/)" type="number" value={f.montoTotal} onChange={e=>s("montoTotal",e.target.value)}/>
        <FInput label="🔒 Depósito (S/)"    type="number" value={f.deposito}   onChange={e=>s("deposito",e.target.value)}/>
        <div className="full"><FTextarea label="📝 Notas" value={f.notas} onChange={e=>s("notas",e.target.value)}/></div>
      </div>

      {(dur>0||Number(f.descuento)>0) && (
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
          {dur>0&&<div className="mcard" style={{flex:1}}><div className="mlabel">⏳ Duración</div><div className="mval">{dur} día{dur!==1?"s":""}</div></div>}
          {Number(f.descuento)>0&&<div className="mcard" style={{flex:1,borderLeft:"2px solid var(--gold)"}}><div className="mlabel">🏷️ Descuento</div><div className="mval" style={{color:"var(--gold2)"}}>{fmtMoney(f.descuento)}</div></div>}
          <div className="mcard" style={{flex:1}}><div className="mlabel">💰 A cobrar</div><div className="mval" style={{color:"var(--green2)",fontWeight:"bold"}}>{fmtMoney(f.montoTotal)}</div></div>
        </div>
      )}

      <div className="modal-ft">
        <Btn v="rose" sz="lg" style={{flex:1}} onClick={()=>{if(f.itemId&&f.cliente.trim())onSave(f,item);}}>✅ Registrar Alquiler</Btn>
        <Btn v="ghost" sz="lg" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

/* ── Venta ────────────────────────────────────────────────────────────── */
export function VentaModal({item, onSave, onClose}) {
  const [cliente,  setC] = useState("");
  const [notas,    setN] = useState("");
  const [descuento,setD] = useState("");
  const monto = applyDisc(item.precioVenta, descuento);

  return (
    <Modal title="💰 Registrar Venta" onClose={onClose} mw={440}>
      <div className="mcard" style={{marginBottom:16}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:36}}>{item.imagen?"":null}</span>
          {item.imagen&&<img src={item.imagen} alt="" style={{width:60,height:60,objectFit:"cover",borderRadius:8,border:"1px solid var(--border)"}}/>}
          <div>
            <div style={{color:"var(--text2)",fontWeight:"bold",fontSize:15}}>{item.nombre}</div>
            <code style={{fontSize:10,color:"var(--rose2)"}}>{item.codigo}</code>
            <div style={{color:"var(--muted)",fontSize:11,marginTop:2}}>{item.calidad} · {item.talla}</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
          <div><div className="mlabel">Precio base</div><div style={{color:"var(--gold2)",fontSize:18,fontWeight:"bold"}}>{fmtMoney(item.precioVenta)}</div></div>
          {Number(descuento)>0&&<div><div className="mlabel">Descuento</div><div style={{color:"var(--yellow2)",fontSize:15}}>-{fmtMoney(descuento)}</div></div>}
          <div><div className="mlabel">A cobrar</div><div style={{color:"var(--green2)",fontSize:20,fontWeight:"bold"}}>{fmtMoney(monto)}</div></div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <FInput label="👤 Cliente" value={cliente} onChange={e=>setC(e.target.value)} placeholder="Nombre del cliente (opcional)"/>
        <FInput label="🏷️ Descuento (S/)" type="number" value={descuento} onChange={e=>setD(e.target.value)} placeholder="0"/>
        <FTextarea label="📝 Notas" value={notas} onChange={e=>setN(e.target.value)}/>
      </div>
      <div className="modal-ft">
        <Btn v="gold" sz="lg" style={{flex:1}} onClick={()=>onSave({item,cliente,notas,descuento})}>💰 Confirmar Venta · {fmtMoney(monto)}</Btn>
        <Btn v="ghost" sz="lg" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}
