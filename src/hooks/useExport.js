import { useCallback } from "react";
import * as XLSX from "xlsx";
import { today } from "@/data/utils.js";

export function useExport({ items, alquileres, historial, caja, users }) {
  return useCallback(() => {
    const wb = XLSX.utils.book_new();

    const inv = items.map(i => ({
      Código: i.codigo, Nombre: i.nombre, Categoría: i.categoria,
      Calidad: i.calidad, Talla: i.talla, Color: i.color,
      Tipo: i.tipo, Estado: i.estado,
      "Precio Alquiler (S/)": i.precioAlquiler || "",
      "Precio Venta (S/)":    i.precioVenta    || "",
      Notas: i.notas,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inv), "Inventario");

    const alq = alquileres.map(a => {
      const it = items.find(i => i.id === a.itemId);
      return {
        Prenda: it?.nombre || "", Código: it?.codigo || "",
        Calidad: it?.calidad || "", Cliente: a.cliente,
        DNI: a.dni, Teléfono: a.telefono,
        "Fecha Inicio": a.fechaInicio, "Fecha Devolución": a.fechaDevolucion,
        "Precio Base": a.precioBase, "Descuento": a.descuento || 0,
        "Monto Total": a.montoTotal, "Depósito": a.deposito,
        Estado: a.estado, Vendedora: a.sellerName, Notas: a.notas,
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(alq), "Alquileres");

    const hist = historial.map(h => ({
      Fecha: h.fecha, Tipo: h.tipo, Prenda: h.itemNombre,
      Código: h.itemCodigo, Cliente: h.cliente,
      Vendedora: h.sellerName,
      "Precio Base": h.precioBase, Descuento: h.descuento || 0,
      "Monto (S/)": h.monto, Notas: h.notas,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hist), "Historial");

    const cajaData = caja.map(m => ({
      Fecha: m.fecha, Tipo: m.tipo, Categoría: m.categoria,
      Descripción: m.descripcion, "Monto (S/)": m.monto, Usuario: m.userName,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cajaData), "Caja");

    const vend = users.filter(u => u.role === "seller").map(u => ({
      Vendedora:  u.name,
      Ventas:     historial.filter(h => h.tipo === "Venta"    && h.sellerId === u.id).length,
      Alquileres: historial.filter(h => h.tipo === "Alquiler" && h.sellerId === u.id).length,
      "Ingresos (S/)": historial.filter(h => h.monto > 0 && h.sellerId === u.id).reduce((a, h) => a + h.monto, 0),
      "Descuentos (S/)": historial.filter(h => h.sellerId === u.id).reduce((a, h) => a + (h.descuento || 0), 0),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vend), "Vendedoras");

    XLSX.writeFile(wb, `milagros_${today()}.xlsx`);
  }, [items, alquileres, historial, caja, users]);
}
