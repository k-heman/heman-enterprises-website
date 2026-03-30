import { useNavigate } from 'react-router-dom';

import type { Product } from '../services/db';
import { useAuth } from '../context/AuthContext';

type ProductCardProps = {
  product: Product;
};

// Format currency in Indian Rupees
export const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined || isNaN(amount)) return 'Price on Request';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div
      onClick={handleDetailsClick}
      className="card flex-col animate-fade-in"
      style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s' }}
    >
      <div
        style={{
          height: '240px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f1f5f9'
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '1rem',
            transition: 'transform 0.5s ease',
            backgroundColor: '#f8fafc'
          }}
          loading="lazy"
          className="product-img"
        />
        {/* Removed the extra onClick from here to keep code clean */}
        <div className="product-badges" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
          <span className="badge glass-dark text-light" style={{ color: 'white', fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>{product.category}</span>
          {product.stock && (
            <span
              className="badge"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#B91C1C',
                border: '1px solid #FEE2E2',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem'
              }}
            >
              {product.stock}
            </span>
          )}
          {!product.inStock && (
            <span
              className="badge"
              style={{
                background: '#EF4444',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '0.65rem',
                padding: '0.2rem 0.5rem'
              }}
            >
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Removed the extra onClick from here too */}
      <div className="card-content flex-col" style={{ flexGrow: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h3 className="heading-xs" style={{ marginBottom: '0.5rem', flexGrow: 1, fontSize: '0.95rem', lineHeight: '1.3' }}>{product.name}</h3>

        <div className="flex-between" style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div className="flex-col" style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', gap: '0.25rem' }}>
          {(!product.pricingType || product.pricingType === 'standard') ? (
            product.discountedPrice && product.actualPrice ? (
              <div className="flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {formatCurrency(product.discountedPrice)}
                  </span>
                  <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                    {Math.round(((product.actualPrice - product.discountedPrice) / product.actualPrice) * 100)}% OFF
                  </span>
                </div>
                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                  {formatCurrency(product.actualPrice)}
                </span>
              </div>
            ) : (
              <span className="text-primary font-bold" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {formatCurrency(product.price)}
              </span>
            )
          ) : product.pricingType === 'wholesale' ? (
            <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 700 }}>Wholesale Price</span>
          ) : (
            <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>Contact for Price</span>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
