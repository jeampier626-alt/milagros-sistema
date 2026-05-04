import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { ESTADO_META, CALIDAD_META } from "@/data/constants.js";
import { fmtMoney } from "@/data/utils.js";
import { Modal, Btn, EstadoBdg, CalidadBdg, TipoBdg } from "@/components/ui/UI.jsx";
import { gE } from "@/components/modals/ItemModal.jsx";
import { AlquilerModal, VentaModal } from "@/components/modals/TxnModals.jsx";

function CatalogoDetail({item, onAlq, onVenta, onClose}) {
  const {currentUser} = useApp();
  return (
    <Modal title="" onClose={onClose} mw={520}>
      <div style={{textAlign:"center",marginBottom:16}}>
        {item.imagen
          ? <img src={item.imagen} alt={item.nombre} style={{width:"100%",maxHeight:280,objectFit:"cover",borderRadius:12,border:"1px solid var(--border)"}}/>
          : <div style={{fontSize:96,padding:"24px 0"}}>{gE(item.categoria)}</div>
        }
      </div>
      <h2 style={{color:"var(--text2)",marginBottom:4}}>{item.nombre}</h2>
      <code style={{fontSize:11,color:"var(--rose2)"}}>{item.codigo}</code>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"10px 0"}}>
        <EstadoBdg estado={item.estado}/>
        <CalidadBdg calidad={item.calidad}/>
        <TipoBdg tipo={item.tipo}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[["📦 Categoría",item.categoria],["📏 Talla",item.talla],["🎨 Color",item.color]].map(([k,v])=>(
          <div className="mcard" key={k}><div className="mlabel">{k}</div><div className="mval">{v}</div></div>
        ))}
        {item.precioAlquiler>0&&<div className="mcard"><div className="mlabel">🔄 Alquiler</div><div className="mval" style={{color:"var(--yellow2)",fontWeight:"bold",fontSize:16}}>{fmtMoney(item.precioAlquiler)}</div></div>}
        {item.precioVenta>0&&<div className="mcard"><div className="mlabel">💰 Venta</div><div className="mval" style={{color:"var(--green2)",fontWeight:"bold",fontSize:16}}>{fmtMoney(item.precioVenta)}</div></div>}
      </div>
      {item.notas&&<div className="mcard" style={{marginBottom:14}}><div className="mlabel">📝 Descripción</div><div style={{color:"var(--text3)",fontSize:13}}>{item.notas}</div></div>}
      {item.estado==="Disponible"&&(
        <div style={{display:"flex",gap:8}}>
          {(item.tipo==="Alquiler"||item.tipo==="Ambos")&&<Btn v="warn" sz="lg" style={{flex:1}} onClick={()=>onAlq(item)}>🔄 Alquilar</Btn>}
          {(item.tipo==="Venta"||item.tipo==="Ambos")&&<Btn v="gold" sz="lg" style={{flex:1}} onClick={()=>onVenta(item)}>💰 Vender</Btn>}
        </div>
      )}
    </Modal>
  );
}

export default function Catalogo() {
  const {items, categories, currentUser, addAlquiler, addVenta} = useApp();
  const [q,   setQ]    = useState("");
  const [cat, setCat]  = useState("");
  const [only, setOnly]= useState(false); // only available
  const [det, setDet]  = useState(null);
  const [txn, setTxn]  = useState(null); // {type:"alq"|"venta", item}

  const list = useMemo(()=>items.filter(i=>{
    if(only&&i.estado!=="Disponible") return false;
    const mC=!cat||i.categoria===cat;
    const mQ=!q||i.nombre.toLowerCase().includes(q.toLowerCase())||i.color.toLowerCase().includes(q.toLowerCase());
    return mC&&mQ;
  }),[items,cat,q,only]);

  const doAlq   = (form,item) => { addAlquiler({form,item,user:currentUser}); setTxn(null); setDet(null); };
  const doVenta = ({item,cliente,notas,descuento}) => { addVenta({item,cliente,notas,descuento,user:currentUser}); setTxn(null); setDet(null); };

  return (
    <div className="fade-in">
      <div className="ph">
        <h2 className="pt2">📸 Catálogo de Prendas</h2>
        <p style={{fontSize:12,color:"var(--muted)",margin:0}}>Muéstrale a tu cliente cómo se ven las prendas</p>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <input className="fi" style={{flex:1,minWidth:200}} value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar por nombre o color…"/>
        <select className="fs" style={{width:"auto"}} value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="" style={{background:"#160d1e"}}>Todas las categorías</option>
          {categories.map(c=><option key={c} style={{background:"#160d1e"}}>{c}</option>)}
        </select>
        <button onClick={()=>setOnly(o=>!o)} style={{background:only?"var(--green)":"var(--card2)",border:`1px solid ${only?"var(--green)":"var(--border)"}`,borderRadius:8,padding:"6px 14px",color:only?"#fff":"var(--muted)",fontFamily:"var(--font)",fontSize:12,cursor:"pointer"}}>
          {only?"✅ Solo disponibles":"Mostrar todos"}
        </button>
      </div>

      {list.length===0
        ? <div style={{textAlign:"center",padding:"60px 0",color:"var(--muted2)"}}><div style={{fontSize:48,marginBottom:12}}>📸</div><p>No se encontraron prendas</p></div>
        : (
          <div className="catalog-grid">
            {list.map(item=>{
              const m = ESTADO_META[item.estado]||{};
              return (
                <div key={item.id} className="cat-item" onClick={()=>setDet(item)}>
                  <div className="cat-img-wrap">
                    {item.imagen
                      ? <img src={item.imagen} alt={item.nombre}/>
                      : <div className="ph-big">{gE(item.categoria)}</div>
                    }
                    <span className="cat-avail">
                      <span style={{background:m.bg,border:`1px solid ${m.color}55`,borderRadius:6,padding:"3px 8px",fontSize:10,color:m.color}}>{m.icon} {item.estado}</span>
                    </span>
                  </div>
                  <div className="cat-item-body">
                    <div className="cat-item-name">{item.nombre}</div>
                    <div className="cat-item-sub">{item.categoria} · {item.talla} · {item.color}</div>
                    <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                      <CalidadBdg calidad={item.calidad}/>
                    </div>
                    <div className="cat-item-price">
                      {item.precioAlquiler>0&&<span style={{color:"var(--yellow2)",marginRight:10}}>🔄 {fmtMoney(item.precioAlquiler)}</span>}
                      {item.precioVenta>0&&<span style={{color:"var(--green2)"}}>💰 {fmtMoney(item.precioVenta)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {det&&!txn&&<CatalogoDetail item={det} onAlq={i=>setTxn({type:"alq",item:i})} onVenta={i=>setTxn({type:"venta",item:i})} onClose={()=>setDet(null)}/>}
      {txn?.type==="alq"   &&<AlquilerModal items={items} preItem={txn.item} onSave={doAlq}   onClose={()=>setTxn(null)}/>}
      {txn?.type==="venta" &&<VentaModal    item={txn.item}                  onSave={doVenta} onClose={()=>setTxn(null)}/>}
    </div>
  );
}
