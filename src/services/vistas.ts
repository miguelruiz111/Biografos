// --- Registro y consulta de vistas de productos en Supabase ---

import { supabase } from '../lib/supabase';

export interface VistasPorProducto {
  producto_id: string;
  total_vistas: number;
}

export interface VistasPorCategoria {
  categoria_id: string | null;
  categoria_nombre: string | null;
  total_vistas: number;
}

// Registra una vista, como máximo una vez por producto y por sesión del navegador.
export async function registrarVista(productoId: string): Promise<void> {
  const key = `vista_${productoId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  const { error } = await supabase.from('vistas_productos').insert({ producto_id: productoId });
  if (error) console.error('Error al registrar vista:', error);
}

export async function getVistasPorProducto(): Promise<VistasPorProducto[]> {
  const { data, error } = await supabase.from('vistas_por_producto').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function getVistasPorCategoria(): Promise<VistasPorCategoria[]> {
  const { data, error } = await supabase
    .from('vistas_por_categoria')
    .select('*')
    .order('total_vistas', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
