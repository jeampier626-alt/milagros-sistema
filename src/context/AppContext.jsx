import { createContext, useContext, useReducer, useCallback, useEffect, useState } from "react";
import { SEED_USERS, DEFAULT_CATS } from "@/data/constants.js";
import { today, uid } from "@/data/utils.js";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// Supabase client (lazy)
let _sb = null;
const getSB = () => {
  if (_sb) return _sb;
  const url = import.meta.env.VITE_SUPABASE_URL || "https://fsdaayedpkvxbyagmihh.supabase.co";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGFheWVkcGt2eGJ5YWdtaWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzYxNTEsImV4cCI6MjA5MzYxMjE1MX0.BFWl9oECnfLOhzm_G5prqSxPNY2En8Mz6jE2ZI0FR5Y";
  if (!url || !key) return null;
  try {
    const { createClient } = window.__supabase || {};
    if (!createClient) return null;
    _sb = createClient(url, key);
    return _sb;
  } catch { return null; }
};

// LocalStorage fallback
const LS = "milagros_v2";
const saveLS = d => { try { localStorage.setItem(LS, JSON.stringify(d)); } catch {} };
const loadLS = () => { try { const r = localStorage.getItem(LS); return r ? JSON.parse(r) : null; } catch { return null; } };

const EMPTY = { users:[], items:[], alquileres:[], historial:[], caja:[], categories:[] };

export function AppProvider({ children }) {
  const [data, setData]       = useState(EMPTY);
  const [currentUser, setCU]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingSB, setUsingSB] = useState(false);

  // ── Load data ───────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Try Supabase first
    const url = import.meta.env.VITE_SUPABASE_URL || "https://fsdaayedpkvxbyagmihh.supabase.co";
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZGFheWVkcGt2eGJ5YWdtaWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzYxNTEsImV4cCI6MjA5MzYxMjE1MX0.BFWl9oECnfLOhzm_G5prqSxPNY2En8Mz6jE2ZI0FR5Y";
    
    if (url && key) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        _sb = createClient(url, key);
        
        const [u, c, i, a, h, ca] = await Promise.all([
          _sb.from("usuarios").select("*").order("id"),
          _sb.from("categorias").select("*").order("id"),
          _sb.from("items").select("*").order("id"),
          _sb.from("alquileres").select("*").order("id"),
          _sb.from("historial").select("*").order("id"),
          _sb.from("caja").select("*").order("id"),
        ]);

        if (!u.error) {
          const loaded = {
            users:      mapUsers(u.data),
            categories: c.data?.map(x => x.name) || DEFAULT_CATS,
            items:      mapItems(i.data),
            alquileres: mapAlq(a.data),
            historial:  mapHist(h.data),
            caja:       mapCaja(ca.data),
          };
          setData(loaded);
          setUsingSB(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Supabase failed, using localStorage", e);
      }
    }

    // Fallback to localStorage
    const saved = loadLS();
    if (saved && saved.users?.length) {
      setData(saved);
    } else {
      setData({ users: SEED_USERS, items: [], alquileres: [], historial: [], caja: [], categories: DEFAULT_CATS });
    }
    setLoading(false);
  }

  // ── Persist helper ──────────────────────────────────────
  const persist = useCallback((newData) => {
    setData(newData);
    if (!usingSB) saveLS(newData);
  }, [usingSB]);

  // ── Auth ────────────────────────────────────────────────
  const login = useCallback((username, password) => {
    const u = data.users.find(u => u.username === username && u.password === password && u.active);
    if (u) { setCU(u); return true; }
    return false;
  }, [data.users]);

  const logout = () => setCU(null);

  // ── Users ───────────────────────────────────────────────
  const addUser = async (d) => {
    const newU = { ...d, id: uid(), active: true };
    if (usingSB) {
      await _sb.from("usuarios").insert({ name:d.name, username:d.username, password:d.password, role:d.role, active:true });
      await loadData(); return;
    }
    persist({ ...data, users: [...data.users, newU] });
  };

  const updateUser = async (d) => {
    if (usingSB) {
      await _sb.from("usuarios").update({ name:d.name, username:d.username, password:d.password, role:d.role, active:d.active }).eq("id", d.id);
      await loadData(); return;
    }
    persist({ ...data, users: data.users.map(u => u.id === d.id ? { ...u, ...d } : u) });
  };

  const deleteUser = async (id) => {
    if (usingSB) { await _sb.from("usuarios").delete().eq("id", id); await loadData(); return; }
    persist({ ...data, users: data.users.filter(u => u.id !== id) });
  };

  // ── Categories ──────────────────────────────────────────
  const addCat = async (name) => {
    if (usingSB) { await _sb.from("categorias").insert({ name }); await loadData(); return; }
    persist({ ...data, categories: [...data.categories, name] });
  };

  const delCat = async (name) => {
    if (usingSB) { await _sb.from("categorias").delete().eq("name", name); await loadData(); return; }
    persist({ ...data, categories: data.categories.filter(c => c !== name) });
  };

  const renCat = async (oldN, newN) => {
    if (usingSB) { await _sb.from("categorias").update({ name: newN }).eq("name", oldN); await loadData(); return; }
    persist({ ...data, categories: data.categories.map(c => c === oldN ? newN : c) });
  };

  // ── Items ───────────────────────────────────────────────
  const addItem = async (d) => {
    const item = { ...d, precioVenta: Number(d.precioVenta)||0, precioAlquiler: Number(d.precioAlquiler)||0 };
    if (usingSB) {
      await _sb.from("items").insert({ nombre:item.nombre, codigo:item.codigo, categoria:item.categoria, calidad:item.calidad, talla:item.talla, color:item.color, estado:item.estado, tipo:item.tipo, precio_venta:item.precioVenta, precio_alquiler:item.precioAlquiler, notas:item.notas||"", imagen:item.imagen||null });
      await loadData(); return;
    }
    persist({ ...data, items: [...data.items, { ...item, id: uid() }] });
  };

  const updateItem = async (d) => {
    const item = { ...d, precioVenta: Number(d.precioVenta)||0, precioAlquiler: Number(d.precioAlquiler)||0 };
    if (usingSB) {
      await _sb.from("items").update({ nombre:item.nombre, codigo:item.codigo, categoria:item.categoria, calidad:item.calidad, talla:item.talla, color:item.color, estado:item.estado, tipo:item.tipo, precio_venta:item.precioVenta, precio_alquiler:item.precioAlquiler, notas:item.notas||"", imagen:item.imagen||null }).eq("id", item.id);
      await loadData(); return;
    }
    persist({ ...data, items: data.items.map(i => i.id === item.id ? item : i) });
  };

  const deleteItem = async (id) => {
    if (usingSB) { await _sb.from("items").delete().eq("id", id); await loadData(); return; }
    persist({ ...data, items: data.items.filter(i => i.id !== id) });
  };

  const setEstado = async (id, estado) => {
    if (usingSB) { await _sb.from("items").update({ estado }).eq("id", id); await loadData(); return; }
    persist({ ...data, items: data.items.map(i => i.id === id ? { ...i, estado } : i) });
  };

  // ── Rentals ─────────────────────────────────────────────
  const addAlquiler = async ({ form, item, user }) => {
    const monto = Number(form.montoTotal)||0;
    if (usingSB) {
      const { data: alqR } = await _sb.from("alquileres").insert({ item_id:item.id, seller_id:user.id, seller_name:user.name, cliente:form.cliente, dni:form.dni||"", telefono:form.telefono||"", fecha_inicio:form.fechaInicio, fecha_devolucion:form.fechaDevolucion, precio_base:item.precioAlquiler, descuento:Number(form.descuento)||0, monto_total:monto, deposito:Number(form.deposito)||0, estado:"Activo", notas:form.notas||"", cancelado:false }).select().single();
      await _sb.from("items").update({ estado:"Alquilado" }).eq("id", item.id);
      await _sb.from("historial").insert({ tipo:"Alquiler", seller_id:user.id, seller_name:user.name, item_id:item.id, item_nombre:item.nombre, item_codigo:item.codigo, cliente:form.cliente, fecha:form.fechaInicio, precio_base:item.precioAlquiler, descuento:Number(form.descuento)||0, monto, notas:form.notas||"", cancelado:false });
      await _sb.from("caja").insert({ tipo:"Ingreso", categoria:"Alquiler", descripcion:`Alquiler: ${item.nombre} — ${form.cliente}`, monto, fecha:form.fechaInicio, user_id:user.id, user_name:user.name });
      await loadData(); return;
    }
    const alqId = uid(); const histId = uid();
    persist({ ...data,
      alquileres: [...data.alquileres, { ...form, id:alqId, itemId:item.id, sellerId:user.id, sellerName:user.name, estado:"Activo", precioBase:item.precioAlquiler, montoTotal:monto, deposito:Number(form.deposito)||0, descuento:Number(form.descuento)||0, cancelado:false }],
      items:      data.items.map(i => i.id===item.id ? {...i,estado:"Alquilado"} : i),
      historial:  [...data.historial, { id:histId, tipo:"Alquiler", sellerId:user.id, sellerName:user.name, itemId:item.id, itemNombre:item.nombre, itemCodigo:item.codigo, cliente:form.cliente, fecha:form.fechaInicio, precioBase:item.precioAlquiler, descuento:Number(form.descuento)||0, monto, notas:form.notas||"", cancelado:false, refAlqId:alqId }],
      caja:       [...data.caja, { id:uid(), tipo:"Ingreso", categoria:"Alquiler", descripcion:`Alquiler: ${item.nombre}`, monto, fecha:form.fechaInicio, userId:user.id, userName:user.name }],
    });
  };

  const devolverAlquiler = async ({ alq, item, user }) => {
    if (usingSB) {
      await _sb.from("alquileres").update({ estado:"Devuelto", fecha_devolucion_real:today() }).eq("id", alq.id);
      await _sb.from("items").update({ estado:"En limpieza" }).eq("id", alq.item_id||alq.itemId);
      await _sb.from("historial").insert({ tipo:"Devolución", seller_id:user.id, seller_name:user.name, item_id:alq.item_id||alq.itemId, item_nombre:item?.nombre||"", item_codigo:item?.codigo||"", cliente:alq.cliente, fecha:today(), precio_base:0, descuento:0, monto:0, notas:"Devolución registrada", cancelado:false });
      await loadData(); return;
    }
    persist({ ...data,
      alquileres: data.alquileres.map(a => a.id===alq.id ? {...a,estado:"Devuelto",fechaDevolucionReal:today()} : a),
      items:      data.items.map(i => i.id===alq.itemId ? {...i,estado:"En limpieza"} : i),
      historial:  [...data.historial, { id:uid(), tipo:"Devolución", sellerId:user.id, sellerName:user.name, itemId:alq.itemId, itemNombre:item?.nombre||"", itemCodigo:item?.codigo||"", cliente:alq.cliente, fecha:today(), precioBase:0, descuento:0, monto:0, notas:"Devolución registrada", cancelado:false }],
    });
  };

  const cancelarAlquiler = async ({ alq, user }) => {
    if (usingSB) {
      await _sb.from("alquileres").update({ estado:"Cancelado", cancelado:true, cancelado_por:user.name, fecha_cancelacion:today() }).eq("id", alq.id);
      await _sb.from("items").update({ estado:"Disponible" }).eq("id", alq.item_id||alq.itemId);
      await _sb.from("historial").update({ cancelado:true, cancelado_por:user.name }).eq("item_id", alq.item_id||alq.itemId).eq("tipo","Alquiler");
      await loadData(); return;
    }
    persist({ ...data,
      alquileres: data.alquileres.map(a => a.id===alq.id ? {...a,estado:"Cancelado",canceladoPor:user.name,fechaCancelacion:today()} : a),
      items:      data.items.map(i => i.id===alq.itemId ? {...i,estado:"Disponible"} : i),
      historial:  data.historial.map(h => h.refAlqId===alq.id ? {...h,cancelado:true,canceladoPor:user.name} : h),
    });
  };

  // ── Sales ───────────────────────────────────────────────
  const addVenta = async ({ item, cliente, notas, descuento, user }) => {
    const monto = Math.max(0, item.precioVenta - (Number(descuento)||0));
    if (usingSB) {
      const { data: histR } = await _sb.from("historial").insert({ tipo:"Venta", seller_id:user.id, seller_name:user.name, item_id:item.id, item_nombre:item.nombre, item_codigo:item.codigo, cliente:cliente||"—", fecha:today(), precio_base:item.precioVenta, descuento:Number(descuento)||0, monto, notas:notas||"", cancelado:false }).select().single();
      await _sb.from("items").update({ estado:"Vendido" }).eq("id", item.id);
      await _sb.from("caja").insert({ tipo:"Ingreso", categoria:"Venta", descripcion:`Venta: ${item.nombre} — ${cliente||"cliente"}`, monto, fecha:today(), user_id:user.id, user_name:user.name, ref_id:histR?.id });
      await loadData(); return;
    }
    const histId = uid();
    persist({ ...data,
      items:     data.items.map(i => i.id===item.id ? {...i,estado:"Vendido"} : i),
      historial: [...data.historial, { id:histId, tipo:"Venta", sellerId:user.id, sellerName:user.name, itemId:item.id, itemNombre:item.nombre, itemCodigo:item.codigo, cliente:cliente||"—", fecha:today(), precioBase:item.precioVenta, descuento:Number(descuento)||0, monto, notas:notas||"", cancelado:false }],
      caja:      [...data.caja, { id:uid(), tipo:"Ingreso", categoria:"Venta", descripcion:`Venta: ${item.nombre}`, monto, fecha:today(), userId:user.id, userName:user.name, refId:histId }],
    });
  };

  const cancelarVenta = async ({ histId, itemId, user }) => {
    if (usingSB) {
      await _sb.from("historial").update({ cancelado:true, cancelado_por:user.name }).eq("id", histId);
      await _sb.from("items").update({ estado:"Disponible" }).eq("id", itemId);
      await _sb.from("caja").update({ cancelado:true }).eq("ref_id", histId);
      await loadData(); return;
    }
    persist({ ...data,
      items:     data.items.map(i => i.id===itemId ? {...i,estado:"Disponible"} : i),
      historial: data.historial.map(h => h.id===histId ? {...h,cancelado:true,canceladoPor:user.name} : h),
      caja:      data.caja.map(c => c.refId===histId ? {...c,cancelado:true} : c),
    });
  };

  const addMovimiento = async ({ tipo, categoria, descripcion, monto, user }) => {
    if (usingSB) {
      await _sb.from("caja").insert({ tipo, categoria, descripcion, monto:Number(monto)||0, fecha:today(), user_id:user.id, user_name:user.name });
      await loadData(); return;
    }
    persist({ ...data, caja: [...data.caja, { id:uid(), tipo, categoria, descripcion, monto:Number(monto)||0, fecha:today(), userId:user.id, userName:user.name }] });
  };

  if (loading) return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0d0812", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:48 }}>💍</div>
      <div style={{ color:"#f8bbd9", fontSize:16, fontFamily:"Georgia,serif" }}>Cargando Casa de Novias Milagros…</div>
    </div>
  );

  return (
    <Ctx.Provider value={{
      ...data, currentUser, usingSB,
      login, logout,
      addUser, updateUser, deleteUser,
      addCat, delCat, renCat,
      addItem, updateItem, deleteItem, setEstado,
      addAlquiler, devolverAlquiler, cancelarAlquiler,
      addVenta, cancelarVenta,
      addMovimiento,
    }}>
      {children}
    </Ctx.Provider>
  );
}

// ── DB mappers (snake_case → camelCase) ──────────────────────────────────
const mapUsers = r => r?.map(u => ({ id:u.id, name:u.name, username:u.username, password:u.password, role:u.role, active:u.active })) || [];
const mapItems = r => r?.map(i => ({ id:i.id, nombre:i.nombre, codigo:i.codigo, categoria:i.categoria, calidad:i.calidad, talla:i.talla, color:i.color, estado:i.estado, tipo:i.tipo, precioVenta:Number(i.precio_venta)||0, precioAlquiler:Number(i.precio_alquiler)||0, notas:i.notas||"", imagen:i.imagen||null })) || [];
const mapAlq  = r => r?.map(a => ({ id:a.id, itemId:a.item_id, sellerId:a.seller_id, sellerName:a.seller_name, cliente:a.cliente, dni:a.dni||"", telefono:a.telefono||"", fechaInicio:a.fecha_inicio, fechaDevolucion:a.fecha_devolucion, fechaDevolucionReal:a.fecha_devolucion_real, precioBase:Number(a.precio_base)||0, descuento:Number(a.descuento)||0, montoTotal:Number(a.monto_total)||0, deposito:Number(a.deposito)||0, estado:a.estado, notas:a.notas||"", cancelado:a.cancelado||false, canceladoPor:a.cancelado_por||"", fechaCancelacion:a.fecha_cancelacion||"" })) || [];
const mapHist = r => r?.map(h => ({ id:h.id, tipo:h.tipo, sellerId:h.seller_id, sellerName:h.seller_name||"", itemId:h.item_id, itemNombre:h.item_nombre||"", itemCodigo:h.item_codigo||"", cliente:h.cliente||"", fecha:h.fecha, precioBase:Number(h.precio_base)||0, descuento:Number(h.descuento)||0, monto:Number(h.monto)||0, notas:h.notas||"", cancelado:h.cancelado||false, canceladoPor:h.cancelado_por||"" })) || [];
const mapCaja = r => r?.map(c => ({ id:c.id, tipo:c.tipo, categoria:c.categoria||"", descripcion:c.descripcion||"", monto:Number(c.monto)||0, fecha:c.fecha, userId:c.user_id, userName:c.user_name||"", refId:c.ref_id, cancelado:c.cancelado||false })) || [];
