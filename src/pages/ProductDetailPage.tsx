// --- Página detalle de producto desde Supabase ---

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import QuantitySelector from '../components/QuantitySelector';
import { getProductoById } from '../services/productos';
import { registrarVista } from '../services/vistas';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    getProductoById(id)
      .then((data) => {
        setProduct(data);
        if (data) registrarVista(data.id);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className={styles.main}><p className={styles.msg}>Cargando...</p></main>;
  if (!product) return (
    <main className={styles.main}>
      <p className={styles.msg}>Producto no encontrado.</p>
      <button className={styles.backBtn} onClick={() => navigate('/catalogo')}>
        <ArrowLeft size={18} /> Volver al catálogo
      </button>
    </main>
  );

  const imagenes = product.imagenes ?? [];
  const imgActual = imagenes[imgIndex];

  return (
    <main className={styles.main}>

      <button className={styles.backBtn} onClick={() => navigate('/catalogo')}>
        <ArrowLeft size={18} /> Volver al Catálogo
      </button>

      <div className={styles.layout}>

        {/* ── Galería de imágenes ── */}
        {imagenes.length > 0 && (
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img src={imgActual} alt={product.nombre} />
            </div>
            {imagenes.length > 1 && (
              <div className={styles.thumbnails}>
                {imagenes.map((img, i) => (
                  <div
                    key={i}
                    className={`${styles.thumb} ${i === imgIndex ? styles.thumbActive : ''}`}
                    onClick={() => setImgIndex(i)}
                  >
                    <img src={img} alt={`Vista ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Info del producto ── */}
        <div className={styles.info}>
          {product.categorias?.nombre && (
            <p className={styles.category}>{product.categorias.nombre}</p>
          )}
          <h1 className={styles.name}>{product.nombre}</h1>

          <div className={styles.priceRow}>
            <p className={styles.price}>{formatPrice(product.precio)}</p>
          </div>

          <div className={styles.divider} />

          <p className={styles.description}>{product.descripcion}</p>

          <p className={styles.stockInfo}>
            {product.stock > 3
              ? `Stock disponible: ${product.stock} unidades`
              : product.stock > 0
              ? `¡Últimas ${product.stock} unidades!`
              : 'Sin stock'}
          </p>

          <div className={styles.quantityRow}>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => Math.min(q + 1, product.stock))}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            />
          </div>

          <Button
            fullWidth
            onClick={() => { addToCart(product, quantity); navigate('/carrito'); }}
            disabled={product.stock === 0}
          >
            Agregar al Carrito — {formatPrice(product.precio * quantity)}
          </Button>

        </div>

      </div>
    </main>
  );
}
