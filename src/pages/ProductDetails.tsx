import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle, ArrowLeft, CheckCircle, Shield, Truck,
  AlertCircle, ShoppingCart, ShieldCheck, Award, Layers, Info
} from 'lucide-react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import 'react-quill-new/dist/quill.snow.css';
import { formatCurrency } from '../components/ProductCard';

import { getProductById } from '../services/db';
import type { Product } from '../services/db';
import { useCart } from '../context/CartContext';

function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    getProductById(id)
      .then(data => {
        if (!data) throw new Error('Product not found');
        setProduct(data);
        setSelectedImage(data.image || (data.images && data.images[0]) || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center section heading-md text-muted">Loading Product Details...</div>;
  if (!product) return <div className="text-center section heading-md text-muted">Product Not Found</div>;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      navigate('/cart');
    }
  };

  return (
    <div className="section container animate-fade-in" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      <Link to="/products" className="btn btn-outline mb-6" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Products
      </Link>

      <div className="card glass" style={{
        display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden'
      }}>
        <div style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          {/* Main Image with Zoom */}
          <Zoom key={selectedImage}>
            <img
              src={selectedImage || 'https://via.placeholder.com/600'}
              alt={product.name}
              loading="lazy"
              style={{ width: '100%', objectFit: 'contain', maxHeight: '600px', borderRadius: '0.5rem' }}
            />
          </Zoom>

          {/* Thumbnails if multiple images exist */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
              {product.images.map((imgUrl, index) => (
                <img
                  key={index}
                  src={imgUrl}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  loading="lazy"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '0.25rem',
                    border: `2px solid ${selectedImage === imgUrl ? 'var(--color-primary)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onClick={() => setSelectedImage(imgUrl)}
                  onMouseOver={() => setSelectedImage(imgUrl)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div style={{ padding: 'clamp(1rem, 5vw, 3rem)', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between mb-4 flex-wrap gap-4">
            <span className="badge">{product.category}</span>

          </div>

          <h1 className="heading-lg" style={{ marginBottom: '1rem' }}>{product.name}</h1>
          <div className="flex-col mb-6" style={{ marginBottom: '2rem', display: 'flex', gap: '0.25rem' }}>
            {(!product.pricingType || product.pricingType === 'standard') ? (
              product.discountedPrice && product.actualPrice ? (
                <div className="flex-col">
                  <div className="flex items-end gap-3">
                    <span className="text-primary font-bold" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                      {formatCurrency(product.discountedPrice)}
                    </span>
                    <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 800, background: '#ecfdf5', padding: '4px 12px', borderRadius: '8px', marginBottom: '4px' }}>
                      {Math.round(((product.actualPrice - product.discountedPrice) / product.actualPrice) * 100)}% DISCOUNT
                    </span>
                  </div>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    MRP: {formatCurrency(product.actualPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-primary font-bold" style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {formatCurrency(product.price)}
                </span>
              )
            ) : (
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)', display: 'block', background: 'rgba(30, 58, 138, 0.05)', padding: '0.8rem 1.2rem', borderRadius: '0.5rem', border: '1px solid rgba(30, 58, 138, 0.1)' }}>
                  Please Contact for Price
                </span>
                {product.pricingType === 'wholesale' && (
                  <span className="text-sm text-green-600 font-bold uppercase tracking-widest">Wholesale Price Available</span>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <span
              className="badge"
              style={{
                background: product.inStock ? 'var(--color-success)' : '#EF4444',
                color: 'white',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
                padding: '0.4rem 0.8rem'
              }}
            >
              {product.inStock ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="text-muted text-lg mb-8 ql-editor" style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.8', padding: 0 }} dangerouslySetInnerHTML={{ __html: product.description }}>
          </div>

          {product.specifications && (
            <div className="specifications" style={{ marginBottom: '3rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
              <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Specifications</h3>
              <div
                className="ql-editor"
                style={{ padding: 0, fontSize: '1rem', color: '#4b5563' }}
                dangerouslySetInnerHTML={{ __html: product.specifications }}
              />
            </div>
          )}

          {/* Trust Attributes (Promises) */}
          {/* Trust Attributes (Promises) - One per line (Task 6) */}
          <div className="flex flex-col mb-10 gap-4" style={{ marginBottom: '3rem' }}>
            {(product.promises?.genuine !== false) && (
              <div className="flex items-center gap-3 text-slate-700 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                <ShieldCheck size={22} className="text-primary" />
                &nbsp;
                <span>100% Genuine Branded Product</span>
                <br /><br />
              </div>
            )}
            {product.promises?.warranty && (
              <div className="flex items-center gap-3 text-slate-700 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                <Shield size={22} className="text-primary" />
                &nbsp;
                <span>Official Warranty Support</span>
                <br /><br />
              </div>
            )}
            {product.promises?.delivery && (
              <div className="flex bg-blue-50/50 p-4 rounded-xl items-center justify-between border border-blue-100">
                <div className="flex items-center gap-3 text-blue-900 font-bold">
                  <Truck size={22} className="text-primary" />
                  &nbsp;
                  <span>Delivery Available</span>
                </div>
                <Link to="/delivery" className="flex items-center gap-1.5 text-sm text-primary hover:underline font-extrabold bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  &nbsp;<Info size={14} /> Instructions
                </Link>
              </div>
            )}
            {product.promises?.steel && (
              <div className="flex items-center gap-3 text-slate-700 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                <Layers size={22} className="text-primary" />
                <span>Premium Stainless Steel</span>
              </div>
            )}
            {product.promises?.guaranty && (
              <div className="flex items-center gap-3 text-slate-700 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                <Award size={22} className="text-primary" />
                <span>Product Guaranty Included</span>
              </div>
            )}
          </div>

          <div className="product-action-grid">
            <button
              onClick={handleAddToCart}
              className="btn btn-secondary product-action-btn"
            >
              <ShoppingCart size={20} /> <span className="btn-text">Add to Cart</span>
            </button>
            <Link
              to={product.inStock ? `/checkout/${product.id}` : '#'}
              className={`btn btn-primary product-action-btn ${!product.inStock ? 'disabled-btn' : ''}`}
              style={{
                opacity: product.inStock ? 1 : 0.6,
                cursor: product.inStock ? 'pointer' : 'not-allowed',
                textDecoration: 'none'
              }}
            >
              <MessageCircle size={22} /> <span className="btn-text">Order now</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .product-action-grid { display: flex; gap: 0.75rem; margin-top: auto; width: 100%; }
        .product-action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1.25rem 0.5rem !important; font-size: 1.1rem; font-weight: 800; border-radius: 1rem; white-space: nowrap; }

        @media (max-width: 600px) {
          .product-action-btn .btn-text { font-size: 0.9rem; }
          .product-action-btn { gap: 0.35rem; padding: 1rem 0.25rem !important; }
        }
      `}</style>
    </div>
  );
}

export default ProductDetails;
