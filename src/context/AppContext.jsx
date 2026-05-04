import { createContext, useContext, useReducer, useCallback } from "react";
import { SEED_USERS, SEED_ITEMS, SEED_ALQUILERES, SEED_HISTORIAL, SEED_CAJA, DEFAULT_CATS } from "@/data/constants.js";
import { today, uid } from "@/data/utils.js";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const init = {
  users:      SEED_USERS,
  items:      SEED_ITEMS,
  alquileres: SEED_ALQUILERES,
  historial:  SEED_HISTORIAL,
  caja:       SEED_CAJA,
  categories: DEFAULT_CATS,
  currentUser:null,
};

function reducer(s, {type,payload}) {
  switch(type) {
    case "LOGIN":         return {...s, currentUser: payload};
    case "LOGOUT":        return {...s, currentUser: null};
    // Users
    case "ADD_USER":      return {...s, users:[...s.users,{...payload,id:uid()}]};
    case "UPD_USER":      return {...s, users:s.users.map(u=>u.id===payload.id?{...u,...payload}:u)};
    case "DEL_USER":      return {...s, users:s.users.filter(u=>u.id!==payload)};
    // Categories
    case "ADD_CAT":       return {...s, categories:[...s.categories,payload]};
    case "DEL_CAT":       return {...s, categories:s.categories.filter(c=>c!==payload)};
    case "REN_CAT":       return {...s, categories:s.categories.map(c=>c===payload.old?payload.new:c)};
    // Items
    case "ADD_ITEM":      return {...s, items:[...s.items,{...payload,id:uid()}]};
    case "UPD_ITEM":      return {...s, items:s.items.map(i=>i.id===payload.id?{...payload}:i)};
    case "DEL_ITEM":      return {...s, items:s.items.filter(i=>i.id!==payload)};
    case "SET_ESTADO":    return {...s, items:s.items.map(i=>i.id===payload.id?{...i,estado:payload.estado}:i)};
    // Alquileres
    case "ADD_ALQ":       return {
      ...s,
      alquileres:[...s.alquileres,{...payload.alq,id:uid()}],
      items:s.items.map(i=>i.id===payload.alq.itemId?{...i,estado:"Alquilado"}:i),
      historial:[...s.historial,{...payload.hist,id:uid()}],
      caja:[...s.caja,{...payload.caja,id:uid()}],
    };
    case "DEVOLVER_ALQ":  return {
      ...s,
      alquileres:s.alquileres.map(a=>a.id===payload.alqId?{...a,estado:"Devuelto",fechaDevolucionReal:today()}:a),
      items:s.items.map(i=>i.id===payload.itemId?{...i,estado:"En limpieza"}:i),
      historial:[...s.historial,{...payload.hist,id:uid()}],
    };
    // Sales
    case "ADD_VENTA":     return {
      ...s,
      items:s.items.map(i=>i.id===payload.itemId?{...i,estado:"Vendido"}:i),
      historial:[...s.historial,{...payload.hist,id:uid()}],
      caja:[...s.caja,{...payload.caja,id:uid()}],
    };
    // Caja
    case "ADD_MOVIMIENTO":return {...s, caja:[...s.caja,{...payload,id:uid()}]};
    default: return s;
  }
}

export function AppProvider({children}) {
  const [state, dispatch] = useReducer(reducer, init);

  const login = useCallback((username, password) => {
    const u = state.users.find(u=>u.username===username&&u.password===password&&u.active);
    if (u) { dispatch({type:"LOGIN",payload:u}); return true; }
    return false;
  }, [state.users]);

  const logout = () => dispatch({type:"LOGOUT"});

  // Users
  const addUser    = d => dispatch({type:"ADD_USER",   payload:{...d,active:true}});
  const updateUser = d => dispatch({type:"UPD_USER",   payload:d});
  const deleteUser = id=> dispatch({type:"DEL_USER",   payload:id});

  // Categories
  const addCat    = n  => dispatch({type:"ADD_CAT",    payload:n});
  const delCat    = n  => dispatch({type:"DEL_CAT",    payload:n});
  const renCat    = (o,n)=>dispatch({type:"REN_CAT",   payload:{old:o,new:n}});

  // Items
  const addItem   = d  => dispatch({type:"ADD_ITEM",   payload:{...d,precioVenta:Number(d.precioVenta)||0,precioAlquiler:Number(d.precioAlquiler)||0}});
  const updateItem= d  => dispatch({type:"UPD_ITEM",   payload:{...d,precioVenta:Number(d.precioVenta)||0,precioAlquiler:Number(d.precioAlquiler)||0}});
  const deleteItem= id => dispatch({type:"DEL_ITEM",   payload:id});
  const setEstado = (id,estado)=>dispatch({type:"SET_ESTADO",payload:{id,estado}});

  // Rentals
  const addAlquiler = ({form, item, user}) => {
    const monto = Number(form.montoTotal)||0;
    dispatch({type:"ADD_ALQ", payload:{
      alq:  {...form, itemId:item.id, sellerId:user.id, sellerName:user.name, estado:"Activo", precioBase:item.precioAlquiler, montoTotal:monto, deposito:Number(form.deposito)||0, descuento:Number(form.descuento)||0},
      hist: {tipo:"Alquiler", sellerId:user.id, sellerName:user.name, itemId:item.id, itemNombre:item.nombre, itemCodigo:item.codigo, cliente:form.cliente, fecha:form.fechaInicio, precioBase:item.precioAlquiler, descuento:Number(form.descuento)||0, monto, notas:form.notas},
      caja: {tipo:"Ingreso", categoria:"Alquiler", descripcion:`Alquiler: ${item.nombre} — ${form.cliente}`, monto, fecha:form.fechaInicio, userId:user.id, userName:user.name},
    }});
  };

  const devolverAlquiler = ({alq, item, user}) => {
    dispatch({type:"DEVOLVER_ALQ", payload:{
      alqId: alq.id, itemId: item?.id,
      hist: {tipo:"Devolución", sellerId:user.id, sellerName:user.name, itemId:alq.itemId, itemNombre:item?.nombre||"", itemCodigo:item?.codigo||"", cliente:alq.cliente, fecha:today(), precioBase:0, descuento:0, monto:0, notas:"Devolución registrada"},
    }});
  };

  // Sales
  const addVenta = ({item, cliente, notas, descuento, user}) => {
    const monto = Math.max(0, item.precioVenta - (Number(descuento)||0));
    dispatch({type:"ADD_VENTA", payload:{
      itemId: item.id,
      hist: {tipo:"Venta", sellerId:user.id, sellerName:user.name, itemId:item.id, itemNombre:item.nombre, itemCodigo:item.codigo, cliente:cliente||"—", fecha:today(), precioBase:item.precioVenta, descuento:Number(descuento)||0, monto, notas:notas||""},
      caja: {tipo:"Ingreso", categoria:"Venta", descripcion:`Venta: ${item.nombre} — ${cliente||"cliente"}`, monto, fecha:today(), userId:user.id, userName:user.name},
    }});
  };

  // Caja
  const addMovimiento = ({tipo, categoria, descripcion, monto, user}) => {
    dispatch({type:"ADD_MOVIMIENTO", payload:{tipo, categoria, descripcion, monto:Number(monto)||0, fecha:today(), userId:user.id, userName:user.name}});
  };

  return (
    <Ctx.Provider value={{
      ...state, login, logout,
      addUser, updateUser, deleteUser,
      addCat, delCat, renCat,
      addItem, updateItem, deleteItem, setEstado,
      addAlquiler, devolverAlquiler,
      addVenta, addMovimiento,
    }}>
      {children}
    </Ctx.Provider>
  );
}
