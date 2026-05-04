import { useState } from "react";
import { Modal, Btn, FInput, FSelect, FTextarea, EstadoBdg, TipoBdg, CalidadBdg, ItemImg } from "@/components/ui/UI.jsx";
import { ESTADOS, TALLAS, TIPOS, CALIDADES } from "@/data/constants.js";
import { fileToDataURL, fmtMoney } from "@/data/utils.js";
import { useApp } from "@/context/AppContext.jsx";

export const CAT_EMOJI = {
  "Vestido de Novia":"👰","Vestido de Quinceaños":"🎀","Vestido de Gala":"✨",
  "Terno":"🤵","Disfraz":"🎭","Traje Típico":"🌺","Dama de Honor":"💐","Accesorio":"👜","Otro":"🧥"
};
export const gE = cat => CAT_EMOJI[cat]||"🧥";

/* ── Detail ───────────────────────────────────────────────────────────── */
export function ItemDetail({item, onClose, onEdit, canEdit}) {
  return (
    <Modal title="Detalle de Prenda" onClose={onClose} mw={500}>
      {item.imagen
        ? <img src={item.imagen} alt={item.nombre} className="iprev" style={{marginBottom:16}}/>
        : <div style={{textAlign:"center",marginBottom:16}}><span style={{fontSize:72}}>{gE(item.categoria)}</span></div>
      }
      <h3 style={{color:"var(--text2)",marginBottom:2}}>{item.nombre}</h3>
      <code style={{fontSize:11,color:"var(--rose2)"}}>{item.codigo}</code>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
        {[["📦 Categoría",item.categoria],["📏 Talla",item.talla],["🎨 Color",item.color],["📌 Estado",<EstadoBdg estado={item.estado}/>],["🏅 Calidad",<CalidadBdg calidad={item.calidad}/>],["🔀 Tipo",<TipoBdg tipo={item.tipo}/>],["🔄 Alquiler",item.precioAlquiler?fmtMoney(item.precioAlquiler):"N/A"],["💰 Venta",item.precioVenta?fmtMoney(item.precioVenta):"N/A"]].map(([k,v])=>(
          <div className="mcard" key={k}><div className="mlabel">{k}</div><div className="mval">{v}</div></div>
        ))}
      </div>
      {item.notas&&<div className="mcard" style={{marginTop:8}}><div className="mlabel">📝 Notas</div><div style={{fontSize:13,color:"var(--text3)"}}>{item.notas}</div></div>}
      <div className="modal-ft">
        {canEdit&&<Btn v="rose" sz="lg" style={{flex:1}} onClick={onEdit}>✏️ Editar</Btn>}
        <Btn v="ghost" sz="lg" style={{flex:1}} onClick={onClose}>Cerrar</Btn>
      </div>
    </Modal>
  );
}

/* ── Form ─────────────────────────────────────────────────────────────── */
export function ItemForm({initial, onSave, onClose}) {
  const {categories} = useApp();
  const isNew = !initial?.id;
  const [f, setF] = useState(initial||{nombre:"",categoria:categories[0]||"",calidad:"En confección",talla:"M",estado:"Disponible",tipo:"Ambos",precioVenta:"",precioAlquiler:"",color:"",codigo:"",notas:"",imagen:null});
  const [mode, setMode]   = useState("file");
  const [url, setUrl]     = useState("");
  const [busy, setBusy]   = useState(false);
  const s = (k,v) => setF(p=>({...p,[k]:v}));

  const onFile = async e => {
    const file = e.target.files?.[0]; if(!file) return;
    setBusy(true);
    const d = await fileToDataURL(file); s("imagen",d); setBusy(false);
  };

  return (
    <Modal title={isNew?"➕ Nueva Prenda":"✏️ Editar Prenda"} onClose={onClose} mw={600}>
      {/* image */}
      <div style={{marginBottom:14}}>
        <div className="fl" style={{marginBottom:7}}>🖼️ Imagen Referencial (opcional)</div>
        {f.imagen&&(
          <div style={{position:"relative",marginBottom:8}}>
            <img src={f.imagen} alt="" className="iprev"/>
            <button onClick={()=>s("imagen",null)} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,.75)",border:"none",borderRadius:6,color:"#fff",padding:"3px 9px",fontSize:12,cursor:"pointer"}}>✕ Quitar</button>
          </div>
        )}
        <div style={{display:"flex",gap:6,marginBottom:7}}>
          {["file","url"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{background:mode===m?"var(--rose2)":"var(--card2)",border:`1px solid ${mode===m?"var(--rose2)":"var(--border)"}`,borderRadius:6,padding:"4px 12px",color:mode===m?"#fff":"var(--muted)",fontSize:12,cursor:"pointer"}}>
              {m==="file"?"📁 Subir foto":"🔗 URL"}
            </button>
          ))}
        </div>
        {mode==="file"
          ? <input type="file" accept="image/*" onChange={onFile} className="fi" style={{padding:"6px 10px"}}/>
          : <div style={{display:"flex",gap:6}}><input className="fi" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…" style={{flex:1}}/><Btn v="ghost" sz="sm" onClick={()=>url.trim()&&s("imagen",url.trim())}>Aplicar</Btn></div>
        }
        {busy&&<p style={{fontSize:12,color:"var(--muted)",marginTop:4}}>Procesando…</p>}
      </div>

      <div className="fg">
        <div className="full"><FInput label="Nombre *" value={f.nombre} onChange={e=>s("nombre",e.target.value)} placeholder="Ej: Vestido de Novia Princesa"/></div>
        <FInput label="Código *"  value={f.codigo} onChange={e=>s("codigo",e.target.value)} placeholder="VN-001"/>
        <FInput label="Color"     value={f.color}  onChange={e=>s("color",e.target.value)}  placeholder="Blanco Marfil"/>
        <FSelect label="📦 Categoría" value={f.categoria} opts={categories}           onChange={e=>s("categoria",e.target.value)}/>
        <FSelect label="🏅 Calidad"   value={f.calidad}   opts={CALIDADES}            onChange={e=>s("calidad",e.target.value)}/>
        <FSelect label="📏 Talla"     value={f.talla}     opts={TALLAS}               onChange={e=>s("talla",e.target.value)}/>
        <FSelect label="📌 Estado"    value={f.estado}    opts={ESTADOS}              onChange={e=>s("estado",e.target.value)}/>
        <FSelect label="🔀 Tipo"      value={f.tipo}      opts={TIPOS}                onChange={e=>s("tipo",e.target.value)}/>
        <FInput label="💰 Precio Venta (S/)"    type="number" value={f.precioVenta}    onChange={e=>s("precioVenta",e.target.value)}/>
        <FInput label="🔄 Precio Alquiler (S/)" type="number" value={f.precioAlquiler} onChange={e=>s("precioAlquiler",e.target.value)}/>
        <div className="full"><FTextarea label="📝 Notas" value={f.notas} onChange={e=>s("notas",e.target.value)}/></div>
      </div>

      <div className="modal-ft">
        <Btn v="rose" sz="lg" style={{flex:1}} onClick={()=>(!f.nombre.trim()||!f.codigo.trim())||onSave(f)}>{isNew?"➕ Agregar":"💾 Guardar"}</Btn>
        <Btn v="ghost" sz="lg" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}
