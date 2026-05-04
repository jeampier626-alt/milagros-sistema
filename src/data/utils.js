export const today    = () => new Date().toISOString().split("T")[0];
export const nowTs    = () => Date.now();
export const addDays  = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };
export const diffDays = (a,b) => Math.ceil((new Date(b)-new Date(a))/86400000);
export const fmtDate  = d => d ? new Date(d+"T12:00:00").toLocaleDateString("es-PE",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—";
export const fmtMoney = n => `S/ ${Number(n||0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`;
export const uid      = () => Date.now()+Math.floor(Math.random()*99999);
export const initials = n => n?.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() || "?";
export const applyDisc= (price, disc) => Math.max(0, Number(price) - Number(disc||0));

export const fileToDataURL = file => new Promise((res,rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});
