import { ESTADO_META, TIPO_META, TXN_META, CALIDAD_META, ROLES } from "@/data/constants.js";
import { initials } from "@/data/utils.js";

export const Btn = ({v="rose",sz="",full,ch,children,...p}) => (
  <button className={["btn",`btn-${v}`,sz?`btn-${sz}`:"",full?"btn-w":""].join(" ")} {...p}>{children||ch}</button>
);

export const Field = ({label,children}) => (
  <div className="field">{label&&<label className="fl">{label}</label>}{children}</div>
);

export const FInput = ({label,...p}) => (
  <Field label={label}><input className="fi" {...p}/></Field>
);

export const FSelect = ({label,opts=[],placeholder,...p}) => (
  <Field label={label}>
    <select className="fs" {...p}>
      {placeholder&&<option value=""style={{background:"#160d1e"}}>{placeholder}</option>}
      {opts.map(o=>{const v=typeof o==="object"?o.v:o,l=typeof o==="object"?o.l:o;return<option key={v} value={v} style={{background:"#160d1e"}}>{l}</option>;})}
    </select>
  </Field>
);

export const FTextarea = ({label,rows=2,...p}) => (
  <Field label={label}><textarea className="fi ft" rows={rows} {...p}/></Field>
);

export const Modal = ({title,onClose,children,mw=560}) => (
  <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal slide-up" style={{maxWidth:mw}}>
      <div className="modal-hd">
        <h2 className="modal-ttl">{title}</h2>
        <button className="modal-x" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export const Bdg = ({color,bg,children}) => (
  <span className="bdg" style={{color,background:bg||color+"18",borderColor:color+"44"}}>{children}</span>
);

export const EstadoBdg = ({estado}) => {
  const m = ESTADO_META[estado]||{};
  return <Bdg color={m.color} bg={m.bg}>{m.icon} {estado}</Bdg>;
};

export const TipoBdg = ({tipo}) => {
  const m = TIPO_META[tipo]||{};
  return <Bdg color={m.color}>{m.icon} {tipo}</Bdg>;
};

export const CalidadBdg = ({calidad}) => {
  const m = CALIDAD_META[calidad]||{};
  return <Bdg color={m.color} bg={m.bg}>{m.icon} {calidad}</Bdg>;
};

export const TxnBdg = ({tipo}) => {
  const m = TXN_META[tipo]||{icon:"📋",color:"var(--muted)"};
  return <Bdg color={m.color}>{m.icon} {tipo}</Bdg>;
};

export const RoleBdg = ({role}) => {
  const r = ROLES[role]||{};
  return <Bdg color={r.color}>{r.icon} {r.label}</Bdg>;
};

export const Avatar = ({name,size=30}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#880e4f,#e91e8c)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.4,color:"#fff",fontWeight:"bold",flexShrink:0}}>
    {initials(name)}
  </div>
);

export const SC = ({icon,val,lbl,color}) => (
  <div className="sc" style={{borderColor:color+"44"}}>
    <span className="si">{icon}</span>
    <span className="sv" style={{color}}>{val}</span>
    <span className="sl">{lbl}</span>
  </div>
);

export const Prog = ({pct,color}) => (
  <div className="pt"><div className="pf" style={{width:`${Math.min(100,pct||0)}%`,background:color||"linear-gradient(90deg,#880e4f,#e91e8c)"}}/></div>
);

export const ItemImg = ({src,emoji,size=44}) => src
  ? <img src={src} alt="" className="iimg" style={{width:size,height:size}}/>
  : <div className="iph" style={{width:size,height:size,fontSize:size*.48}}>{emoji||"👗"}</div>;

export const Empty = ({icon,text}) => (
  <div style={{textAlign:"center",padding:"52px 0",color:"var(--muted2)"}}>
    <div style={{fontSize:44,marginBottom:12}}>{icon}</div>
    <p style={{fontSize:13}}>{text}</p>
  </div>
);
