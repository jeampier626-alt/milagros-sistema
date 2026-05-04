import { useState } from "react";
import { useApp } from "@/context/AppContext.jsx";
import { Btn } from "@/components/ui/UI.jsx";

export default function Login() {
  const { login } = useApp();
  const [u, setU]   = useState("");
  const [p, setP]   = useState("");
  const [err, setE] = useState("");
  const [busy, setB]= useState(false);

  const go = async e => {
    e.preventDefault();
    setB(true); setE("");
    await new Promise(r=>setTimeout(r,250));
    if (!login(u.trim(), p)) setE("Usuario o contraseña incorrectos");
    setB(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <span style={{fontSize:54,display:"block",marginBottom:8}}>💍</span>
          <p className="auth-name">Sistema de Inventario</p>
          <h1 className="auth-title">Casa de Novias</h1>
          <h2 style={{fontSize:22,color:"var(--rose2)",margin:"2px 0 0",fontWeight:"normal"}}>Milagros</h2>
          <p className="auth-sub" style={{marginTop:6}}>Inventario · Caja · Catálogo</p>
        </div>

        {err && <div className="auth-err">⚠️ {err}</div>}

        <form onSubmit={go} style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="field">
            <label className="fl">👤 Usuario</label>
            <input className="fi" type="text" value={u} onChange={e=>{setU(e.target.value);setE("");}} placeholder="Tu nombre de usuario" autoComplete="username" required/>
          </div>
          <div className="field">
            <label className="fl">🔒 Contraseña</label>
            <input className="fi" type="password" value={p} onChange={e=>{setP(e.target.value);setE("");}} placeholder="Tu contraseña" autoComplete="current-password" required/>
          </div>
          <Btn v="rose" sz="lg" full type="submit" disabled={busy}>{busy?"Ingresando…":"✨ Ingresar al Sistema"}</Btn>
        </form>

        <div className="auth-demo">
          <p className="auth-demo-title">Cuentas de demostración</p>
          {[["👑 Dueña","Victoria1904","pequeñita951"],["🛡️ Admin","Rosario1547","tengosueño7542"],["🛡️ Admin","Jeampier","Jeampier626"]].map(([r,u,p])=>(
            <div className="auth-demo-row" key={u}>
              <span>{r}</span>
              <code style={{color:"var(--text3)",fontSize:11}}>{u} / {p}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
