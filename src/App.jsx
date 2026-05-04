import { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext.jsx";
import Login     from "@/components/Login.jsx";
import Header    from "@/components/Header.jsx";
import Inventario from "@/components/pages/Inventario.jsx";
import Catalogo  from "@/components/pages/Catalogo.jsx";
import Ventas    from "@/components/pages/Ventas.jsx";
import Alquileres from "@/components/pages/Alquileres.jsx";
import Historial from "@/components/pages/Historial.jsx";
import Caja      from "@/components/pages/Caja.jsx";
import Dashboard from "@/components/pages/Dashboard.jsx";
import Ajustes   from "@/components/pages/Ajustes.jsx";
import { useExport } from "@/hooks/useExport.js";
import { can } from "@/data/constants.js";

function Shell() {
  const { currentUser, items, alquileres, historial, caja, users } = useApp();
  const [tab, setTab]               = useState("dashboard");
  const [addTrigger, setAddTrigger] = useState(0);

  const exportExcel = useExport({ items, alquileres, historial, caja, users });

  if (!currentUser) return <Login />;

  const role = currentUser.role;

  const handleTab = t => {
    setTab(t);
    if (t === "inventario") setAddTrigger(n => n + 1);
  };

  // Restrict tabs based on role
  const allowed = {
    dashboard:  can(role, "inventory"),
    inventario: can(role, "inventory"),
    catalogo:   can(role, "catalog"),
    ventas:     can(role, "sales"),
    alquileres: can(role, "rentals"),
    historial:  true,
    caja:       can(role, "caja"),
    ajustes:    can(role, "inventory"),
  };

  const safeTab = allowed[tab] ? tab : "catalogo";

  return (
    <div className="app">
      <Header tab={safeTab} setTab={handleTab} onExport={exportExcel} />
      <main className="page-body">
        {safeTab === "dashboard"  && <Dashboard />}
        {safeTab === "inventario" && <Inventario addTrigger={addTrigger} />}
        {safeTab === "catalogo"   && <Catalogo />}
        {safeTab === "ventas"     && <Ventas />}
        {safeTab === "alquileres" && <Alquileres />}
        {safeTab === "historial"  && <Historial />}
        {safeTab === "caja"       && <Caja />}
        {safeTab === "ajustes"    && <Ajustes />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
