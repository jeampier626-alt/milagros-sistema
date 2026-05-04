import { useApp } from "@/context/AppContext.jsx";
import { Avatar, Btn } from "@/components/ui/UI.jsx";
import { ROLES, can } from "@/data/constants.js";

const TABS = [
  {k:"inventario", i:"📦", l:"Inventario",  p:"inventory"},
  {k:"catalogo",   i:"📸", l:"Catálogo",     p:"catalog"},
  {k:"ventas",     i:"💰", l:"Ventas",        p:"sales"},
  {k:"alquileres", i:"🔄", l:"Alquileres",   p:"rentals"},
  {k:"historial",  i:"📜", l:"Historial",    p:null},
  {k:"caja",       i:"💵", l:"Caja",          p:"caja"},
  {k:"ajustes",    i:"⚙️", l:"Ajustes",      p:"inventory"},
];

export default function Header({tab, setTab, onExport}) {
  const {currentUser, logout} = useApp();
  const r = currentUser?.role;
  const tabs = TABS.filter(t => !t.p || can(r, t.p));

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-row">
          <div className="logo">
            <span className="logo-gem">💍</span>
            <div>
              <div className="logo-name">Casa de Novias Milagros</div>
              <div className="logo-tag">Inventario · Caja · Catálogo</div>
            </div>
          </div>
          <div className="header-right">
            {can(r,"export") && <Btn v="success" sz="sm" onClick={onExport}>⬇ Excel</Btn>}
            <div className="user-pill">
              <Avatar name={currentUser?.name} size={28}/>
              <div style={{lineHeight:1.3}}>
                <div className="user-name">{currentUser?.name?.split(" ")[0]}</div>
                <div className="user-role" style={{color:ROLES[r]?.color}}>{ROLES[r]?.icon} {ROLES[r]?.label}</div>
              </div>
            </div>
            <Btn v="ghost" sz="sm" onClick={logout} title="Cerrar sesión">🚪</Btn>
          </div>
        </div>
        <nav className="nav">
          {tabs.map(t=>(
            <button key={t.k} className={`nav-btn${tab===t.k?" on":""}`} onClick={()=>setTab(t.k)}>
              {t.i} {t.l}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
