// --- Panel de administración: layout con sidebar y secciones ---

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, CheckSquare, BarChart3, LogOut } from 'lucide-react';
import AdminProductos from './admin/AdminProductos';
import AdminVentas from './admin/AdminVentas';
import AdminTareas from './admin/AdminTareas';
import AdminEstadisticas from './admin/AdminEstadisticas';
import { useAuth } from '../context/AuthContext';
import styles from './admin/AdminPage.module.css';

type Seccion = 'productos' | 'ventas' | 'tareas' | 'estadisticas';

const NAV_ITEMS: { key: Seccion; label: string; icon: React.ReactNode }[] = [
  { key: 'productos',    label: 'Productos',     icon: <Package size={16} /> },
  { key: 'ventas',       label: 'Ventas',        icon: <ShoppingBag size={16} /> },
  { key: 'tareas',       label: 'Tareas',        icon: <CheckSquare size={16} /> },
  { key: 'estadisticas', label: 'Estadísticas',  icon: <BarChart3 size={16} /> },
];

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState<Seccion>('productos');

  // DEV: permite ver el panel sin login mientras no hay Supabase real conectado en localhost.
  // import.meta.env.DEV es false en el build de producción, así que esta rama se elimina sola.
  const skipAuth = import.meta.env.DEV;

  useEffect(() => {
    if (!loading && !user && !skipAuth) navigate('/login');
  }, [loading, user, skipAuth, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading || (!user && !skipAuth)) return null;

  return (
    <div className={styles.layout}>

      {/* ── Top bar mobile ── */}
      <div className={styles.mobileTopBar}>
        <div className={styles.mobileTopBarBrand}>
          <span className={styles.mobileTopBarTitle}>BIOGRAFO</span>
          <span className={styles.mobileTopBarSub}>Panel Admin</span>
        </div>
        <div className={styles.mobileNavRow}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={seccion === item.key ? styles.mobileNavBtnActive : styles.mobileNavBtn}
              onClick={() => setSeccion(item.key)}
            >
              {item.icon}
            </button>
          ))}
          <a href="/" className={styles.mobileTopBarLink}>← Tienda</a>
          <button className={styles.mobileNavBtn} onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.sidebarTitle}>BIOGRAFO</span>
          <span className={styles.sidebarSub}>Panel Admin</span>
        </div>
        <nav className={styles.sidebarNav}>
          <a href="/" className={styles.sidebarLink}>← Ver tienda</a>
          <div className={styles.sidebarDivider} />
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={seccion === item.key ? styles.sidebarLinkActive : styles.sidebarLinkBtn}
              onClick={() => setSeccion(item.key)}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <div className={styles.sidebarDivider} />
          <button className={styles.sidebarLinkBtn} onClick={handleLogout}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* ── Contenido de la sección activa ── */}
      <main className={styles.main}>
        {seccion === 'productos'    && <AdminProductos />}
        {seccion === 'ventas'       && <AdminVentas />}
        {seccion === 'tareas'       && <AdminTareas />}
        {seccion === 'estadisticas' && <AdminEstadisticas />}
      </main>

    </div>
  );
}
