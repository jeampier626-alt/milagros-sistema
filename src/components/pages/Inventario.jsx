import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { can, ESTADOS, ESTADO_META } from "@/data/constants.js";
import { fmtMoney } from "@/data/utils.js";
import { Btn, EstadoBdg, TipoBdg, CalidadBdg, ItemImg, Empty } from "@/components/ui/UI.jsx";
import { ItemDetail, ItemForm, gE } from "@/components/modals/ItemModal.jsx";
import { AlquilerModal, VentaModal } from "@/components/modals/TxnModals.jsx";

export default function Inventario({addTrigger}) {
  const {items, categories, currentUser, addItem, updateItem, deleteItem, setEstado, addAlquiler, addVenta} = useApp();
  const canEdit = can(currentUser.role,"inventory");

  const [q, setQ]       = useState("");
  const [cat, setCat]   = useState("");
  const [est, setEst]   = useState("");
  const [modal, setM]   = useState(null);
  const [sel, setSel]   = useState(null);

  useEffect(()=>{if(addTrigger>0&&canEdit)setM("add");},[addTrigger]);

  const list = useMemo(()=>items.filter(i=>{
    const mC = !cat||i.categoria===cat;
    const mE = !est||i.estado===est;
    const mQ = !q||i.nombre.toLowerCase().includes(q.toLowerCase())||i.codigo.toLowerCase().includes(q.toLowerCase())||i.color.toLowerCase().includes(q.toLowerCase());
    return mC&&mE&&mQ;
  }),[items,cat,est,q]);

  const close = ()=>{setM(null);setSel(null);};

  const saveItem = form => { if(modal==="add") addItem(form); else updateItem({...form,id:sel.id}); close(); };
  const doAlq  = (form,item) => { addAlquiler({form,item,user:currentUser}); close(); };
  const doVenta= ({item,cliente,notas,descuento}) => { addVenta({item,cliente,notas,descuento,user:currentUser}); close(); };
  const doDel  = it => { if(window.confirm(`¿Eliminar "${it.nombre}"?`)){deleteItem(it.id);close();} };

  return (
    <div className="fade-in">
      <div className="ph">
        <h2 className="pt2">📦 Inventario</h2>
        {canEdit&&<Btn v="rose" onClick={()=>setM("add")}>➕ Nueva Prenda</Btn>}
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        <input className="fi" style={{flex:1,minWidth:200}} value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar nombre, código, color…"/>
        <select className="fs" style={{width:"auto"}} value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="" style={{background:"#160d1e"}}>Todas las categorías</option>
          {categories.map(c=><option key={c} style={{background:"#160d1e"}}>{c}</option>)}
        </select>
        <select className="fs" style={{width:"auto"}} value={est} onChange={e=>setEst(e.target.value)}>
          <option value="" style={{background:"#160d1e"}}>Todos los estados</option>
          {ESTADOS.map(e=><option key={e} style={{background:"#160d1e"}}>{e}</option>)}
        </select>
      </div>
      <p style={{fontSize:11,color:"var(--muted2)",marginBottom:10}}>{list.length} prenda{list.length!==1?"s":""}</p>

      <div className="tcard">
        <div className="twrap">
          <table className="dtable">
            <thead><tr>
              <th>Img</th><th>Código</th><th>Prenda</th><th>Categoría</th>
              <th>Calidad</th><th>Talla</th><th>Tipo</th><th>Estado</th>
              <th>🔄 Alquiler</th><th>💰 Venta</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              {list.length===0&&<tr><td colSpan={11} className="empty-td">No se encontraron prendas</td></tr>}
              {list.map(it=>(
                <tr key={it.id}>
                  <td><ItemImg src={it.imagen} emoji={gE(it.categoria)} size={40}/></td>
                  <td><code style={{fontSize:10,color:"var(--rose2)"}}>{it.codigo}</code></td>
                  <td style={{color:"var(--text2)",fontWeight:"bold",maxWidth:180}}>{it.nombre}</td>
                  <td style={{fontSize:11,color:"var(--text3)"}}>{gE(it.categoria)} {it.categoria}</td>
                  <td><CalidadBdg calidad={it.calidad}/></td>
                  <td style={{color:"var(--text3)"}}>{it.talla}</td>
                  <td><TipoBdg tipo={it.tipo}/></td>
                  <td>
                    {canEdit
                      ? <select value={it.estado} onChange={e=>setEstado(it.id,e.target.value)} style={{background:ESTADO_META[it.estado]?.bg,border:`1px solid ${ESTADO_META[it.estado]?.color}55`,borderRadius:6,padding:"3px 7px",color:ESTADO_META[it.estado]?.color,fontSize:11,cursor:"pointer",outline:"none",fontFamily:"var(--font)"}}>
                          {ESTADOS.map(e=><option key={e} style={{background:"#160d1e",color:"#fff"}}>{e}</option>)}
                        </select>
                      : <EstadoBdg estado={it.estado}/>
                    }
                  </td>
                  <td style={{color:"var(--yellow2)"}}>{it.precioAlquiler?fmtMoney(it.precioAlquiler):"—"}</td>
                  <td style={{color:"var(--green2)"}}>{it.precioVenta?fmtMoney(it.precioVenta):"—"}</td>
                  <td>
                    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                      <Btn v="ghost" sz="xs" onClick={()=>{setSel(it);setM("detail");}}>👁</Btn>
                      {canEdit&&<Btn v="ghost" sz="xs" onClick={()=>{setSel(it);setM("edit");}}>✏️</Btn>}
                      {(it.tipo==="Alquiler"||it.tipo==="Ambos")&&it.estado==="Disponible"&&<Btn v="warn" sz="xs" onClick={()=>{setSel(it);setM("alq");}}>🔄</Btn>}
                      {(it.tipo==="Venta"||it.tipo==="Ambos")&&it.estado==="Disponible"&&<Btn v="success" sz="xs" onClick={()=>{setSel(it);setM("venta");}}>💰</Btn>}
                      {canEdit&&<Btn v="danger" sz="xs" onClick={()=>doDel(it)}>🗑</Btn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal==="add"    &&<ItemForm    initial={null} onSave={saveItem} onClose={close}/>}
      {modal==="edit"   &&<ItemForm    initial={sel}  onSave={saveItem} onClose={close}/>}
      {modal==="detail" &&<ItemDetail  item={sel} canEdit={canEdit} onEdit={()=>setM("edit")} onClose={close}/>}
      {modal==="alq"    &&<AlquilerModal items={items} preItem={sel} onSave={doAlq}  onClose={close}/>}
      {modal==="venta"  &&<VentaModal    item={sel}  onSave={doVenta} onClose={close}/>}
    </div>
  );
}
