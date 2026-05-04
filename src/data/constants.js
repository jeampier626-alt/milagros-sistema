// ── Roles & permissions ───────────────────────────────────────────────────
export const ROLES = {
  owner:  { key:"owner",  label:"Dueña",         icon:"👑", color:"#f0c040" },
  admin:  { key:"admin",  label:"Administrador",  icon:"🛡️", color:"#60a5fa" },
  seller: { key:"seller", label:"Vendedora",      icon:"🛍️", color:"#4ade80" },
};

export const PERMS = {
  owner:  ["all"],
  admin:  ["inventory","rentals","sales","caja","history","export","catalog"],
  seller: ["rentals","sales","history_own","catalog"],
};

export const can = (role, perm) => {
  if (role === "owner") return true;
  return PERMS[role]?.includes(perm) ?? false;
};

// ── Default categories ────────────────────────────────────────────────────
export const DEFAULT_CATS = [
  "Vestido de Novia","Vestido de Quinceaños","Vestido de Gala",
  "Terno","Disfraz","Traje Típico","Dama de Honor","Accesorio","Otro",
];

// ── Quality levels ────────────────────────────────────────────────────────
export const CALIDADES = ["En confección","Semi usado","En uso"];

export const CALIDAD_META = {
  "En confección": { color:"#4ade80", bg:"#0a2010", icon:"✨" },
  "Semi usado":    { color:"#fbbf24", bg:"#1e1000", icon:"🔶" },
  "En uso":        { color:"#60a5fa", bg:"#0a1428", icon:"👗" },
};

// ── Item states ───────────────────────────────────────────────────────────
export const ESTADOS = ["Disponible","Alquilado","Vendido","En limpieza","Dañado","Reservado"];

export const ESTADO_META = {
  "Disponible":  { color:"#4ade80", bg:"#0a2010", icon:"✅" },
  "Alquilado":   { color:"#fbbf24", bg:"#1e1000", icon:"🔄" },
  "Vendido":     { color:"#9ca3af", bg:"#111111", icon:"🏷️"  },
  "En limpieza": { color:"#60a5fa", bg:"#0a1428", icon:"🧺" },
  "Dañado":      { color:"#f87171", bg:"#1e0808", icon:"⚠️" },
  "Reservado":   { color:"#a78bfa", bg:"#120a28", icon:"📌" },
};

export const TALLAS = ["XS","S","M","L","XL","XXL","Único","A/U"];
export const TIPOS  = ["Venta","Alquiler","Ambos"];

export const TIPO_META = {
  "Venta":    { icon:"💰", color:"#4ade80" },
  "Alquiler": { icon:"🔄", color:"#fbbf24" },
  "Ambos":    { icon:"🔀", color:"#60a5fa" },
};

// ── Transaction types ─────────────────────────────────────────────────────
export const TXN_META = {
  "Venta":      { icon:"💰", color:"#4ade80" },
  "Alquiler":   { icon:"🔄", color:"#fbbf24" },
  "Devolución": { icon:"↩️",  color:"#60a5fa" },
  "Gasto":      { icon:"📤", color:"#f87171" },
  "Ingreso":    { icon:"📥", color:"#4ade80" },
};

// ── Initial users ─────────────────────────────────────────────────────────
export const SEED_USERS = [
  { id:1, name:"Milagros Flores",  username:"duena",   password:"milagros2024", role:"owner",  active:true },
  { id:2, name:"Carmen Rodríguez", username:"admin",   password:"admin123",     role:"admin",  active:true },
  { id:3, name:"Rosa Quispe",      username:"rosa",    password:"rosa123",      role:"seller", active:true },
  { id:4, name:"Ana Torres",       username:"ana",     password:"ana123",       role:"seller", active:true },
];

// ── Initial inventory ─────────────────────────────────────────────────────
export const SEED_ITEMS = [
  { id:1,  nombre:"Vestido de Novia Princesa",   categoria:"Vestido de Novia",      calidad:"En confección", talla:"M",    estado:"Disponible", tipo:"Alquiler", precioVenta:0,    precioAlquiler:350, color:"Blanco Marfil", codigo:"VN-001", notas:"Cola larga con encaje",   imagen:null },
  { id:2,  nombre:"Terno Clásico Negro",         categoria:"Terno",                 calidad:"En uso",        talla:"L",    estado:"Disponible", tipo:"Ambos",    precioVenta:550,  precioAlquiler:90,  color:"Negro",         codigo:"T-001",  notas:"",                       imagen:null },
  { id:3,  nombre:"Vestido de Quinceaños Rosa",  categoria:"Vestido de Quinceaños", calidad:"En confección", talla:"S",    estado:"Disponible", tipo:"Alquiler", precioVenta:0,    precioAlquiler:280, color:"Rosa Fucsia",   codigo:"VQ-001", notas:"Con pedrería",           imagen:null },
  { id:4,  nombre:"Vestido de Gala Rojo",        categoria:"Vestido de Gala",       calidad:"Semi usado",    talla:"M",    estado:"Disponible", tipo:"Ambos",    precioVenta:320,  precioAlquiler:80,  color:"Rojo",          codigo:"VG-001", notas:"",                       imagen:null },
  { id:5,  nombre:"Disfraz Reina de Corazones",  categoria:"Disfraz",               calidad:"En uso",        talla:"Único",estado:"Disponible", tipo:"Alquiler", precioVenta:0,    precioAlquiler:45,  color:"Rojo/Negro",    codigo:"D-001",  notas:"",                       imagen:null },
  { id:6,  nombre:"Traje Típico Ancashino",      categoria:"Traje Típico",          calidad:"Semi usado",    talla:"M",    estado:"Disponible", tipo:"Ambos",    precioVenta:240,  precioAlquiler:60,  color:"Multicolor",    codigo:"TT-001", notas:"Bordado a mano",         imagen:null },
  { id:7,  nombre:"Vestido Dama de Honor Lila",  categoria:"Dama de Honor",         calidad:"En confección", talla:"XS",   estado:"Disponible", tipo:"Alquiler", precioVenta:0,    precioAlquiler:120, color:"Lila",          codigo:"DH-001", notas:"",                       imagen:null },
  { id:8,  nombre:"Corona de Novia con Velo",    categoria:"Accesorio",             calidad:"En uso",        talla:"A/U",  estado:"Disponible", tipo:"Ambos",    precioVenta:80,   precioAlquiler:25,  color:"Blanco",        codigo:"ACC-001",notas:"",                       imagen:null },
];

// ── Initial transactions ──────────────────────────────────────────────────
export const SEED_ALQUILERES = [
  { id:101, itemId:2, sellerId:3, sellerName:"Rosa Quispe", cliente:"Carlos Mendoza", dni:"12345678", telefono:"987654321", fechaInicio:"2026-04-28", fechaDevolucion:"2026-05-06", precioBase:90, descuento:0, montoTotal:90, deposito:45, notas:"", estado:"Activo" },
];

export const SEED_HISTORIAL = [
  { id:1001, tipo:"Venta",    sellerId:3, sellerName:"Rosa Quispe",  itemId:null, itemNombre:"Vestido Azul Celeste", itemCodigo:"VG-002", cliente:"María Torres",   fecha:"2026-04-20", precioBase:320, descuento:20, monto:300, notas:"Cliente frecuente" },
  { id:1002, tipo:"Alquiler", sellerId:3, sellerName:"Rosa Quispe",  itemId:2,    itemNombre:"Terno Clásico Negro",  itemCodigo:"T-001",  cliente:"Carlos Mendoza", fecha:"2026-04-28", precioBase:90,  descuento:0,  monto:90,  notas:"" },
  { id:1003, tipo:"Venta",    sellerId:4, sellerName:"Ana Torres",   itemId:null, itemNombre:"Accesorio Corona",     itemCodigo:"ACC-002",cliente:"Lucía Campos",   fecha:"2026-04-30", precioBase:85,  descuento:5,  monto:80,  notas:"" },
];

export const SEED_CAJA = [
  { id:2001, tipo:"Ingreso", categoria:"Apertura", descripcion:"Saldo inicial", monto:500, fecha:"2026-05-01", userId:1, userName:"Milagros Flores" },
];
