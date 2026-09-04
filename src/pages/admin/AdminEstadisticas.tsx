// --- Sección Estadísticas: vistas por producto y por categoría ---

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { getProductos } from '../../services/productos';
import { getVistasPorProducto, getVistasPorCategoria } from '../../services/vistas';
import type { Product } from '../../types';
import type { VistasPorCategoria } from '../../services/vistas';
import styles from './AdminEstadisticas.module.css';

interface FilaProducto {
  producto: Product;
  vistas: number;
}

export default function AdminEstadisticas() {
  const [filas, setFilas] = useState<FilaProducto[]>([]);
  const [porCategoria, setPorCategoria] = useState<VistasPorCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProductos(), getVistasPorProducto(), getVistasPorCategoria()])
      .then(([productos, vistasProducto, vistasCategoria]) => {
        const mapa = new Map(vistasProducto.map(v => [v.producto_id, v.total_vistas]));
        const nuevasFilas = productos
          .map(producto => ({ producto, vistas: mapa.get(producto.id) ?? 0 }))
          .sort((a, b) => b.vistas - a.vistas);

        setFilas(nuevasFilas);
        setPorCategoria(vistasCategoria);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalVistas = filas.reduce((acc, f) => acc + f.vistas, 0);
  const maxCategoria = Math.max(1, ...porCategoria.map(c => c.total_vistas));

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Estadísticas</h1>
        <span className={styles.badge}><Eye size={13} /> {totalVistas} vistas totales</span>
      </div>

      {loading ? (
        <p style={{ padding: '2rem', color: 'var(--color-gray)', textAlign: 'center' }}>Cargando...</p>
      ) : (
        <>
          {/* ── Vistas por categoría ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Vistas por categoría</h2>
            {porCategoria.length === 0 ? (
              <p className={styles.empty}>Todavía no hay vistas registradas.</p>
            ) : (
              <div className={styles.barList}>
                {porCategoria.map(c => (
                  <div key={c.categoria_id ?? 'sin-categoria'} className={styles.barRow}>
                    <span className={styles.barLabel}>{c.categoria_nombre ?? 'Sin categoría'}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${(c.total_vistas / maxCategoria) * 100}%` }}
                      />
                    </div>
                    <span className={styles.barValue}>{c.total_vistas}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Vistas por producto ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Vistas por producto</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Vistas</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(({ producto, vistas }) => (
                    <tr key={producto.id}>
                      <td className={styles.tdProducto}>{producto.nombre}</td>
                      <td className={styles.tdCategoria}>{producto.categorias?.nombre ?? '—'}</td>
                      <td className={styles.tdVistas}>{vistas}</td>
                    </tr>
                  ))}
                  {filas.length === 0 && (
                    <tr><td colSpan={3} className={styles.empty}>No hay productos todavía.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
