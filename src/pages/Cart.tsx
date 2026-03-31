import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowLeft, ShoppingCart, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';


const Cart: React.FC = () => {
  const { cart, removeFromCart, cartTotal } = useCart();
  const { user } = useAuth();


  const handleWhatsAppCheckout = () => {
    const phoneNumber = "919014627762"; // From WhatsAppButton.tsx
    const itemsList = cart.map(item => `- ${item.name} (₹${item.price.toLocaleString()})`).join('\n');
    const userName = user?.name || "Customer";
    const message = `I am ${userName} and I am interested to buy the following items:\n${itemsList}\n\nTotal Price: ₹${cartTotal.toLocaleString()}\n\nShare more details.`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <div className="flex-center flex-col animate-fade-in" style={{ gap: '2.5rem', padding: '4rem 0' }}>
          <div className="cart-empty-icon" style={{
            backgroundColor: '#f8fafc',
            padding: '3rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #cbd5e1'
          }}>
            <ShoppingCart size={80} style={{ color: 'var(--color-primary)', opacity: 0.2 }} />
          </div>
          <div style={{ maxWidth: '600px' }}>
            <h2 className="heading-lg" style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '1rem' }}>Your Cart is Empty</h2>
            <p className="text-muted" style={{ fontSize: '1.25rem', lineHeight: '1.6', opacity: 0.8 }}>
              Looks like you haven't added anything yet. Explore our range of premium home products and furniture.
            </p>
          </div>
          <Link to="/products" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.25rem', borderRadius: '1rem', boxShadow: 'var(--shadow-xl)' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 animate-fade-in" style={{ maxWidth: '1200px', padding: '3rem 1.5rem' }}>
      <div className="flex-between mb-12 flex-wrap" style={{ gap: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '2rem' }}>
        <div className="flex flex-col" style={{ gap: '0.5rem' }}>
          <Link to="/products" className="flex items-center gap-2" style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
          <h1 className="heading-lg cart-title-main">My Shopping Cart</h1>
        </div>
        <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.05)', color: 'var(--color-primary)', padding: '0.75rem 1.5rem', borderRadius: '100px', fontWeight: 800, border: '1px solid rgba(30, 58, 138, 0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={20} />
          {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '3rem', alignItems: 'start' }}>
          {/* Main List */}
          <div className="flex flex-col" style={{ gap: '1rem', gridColumn: '1 / -1' }}>
            <div className="hidden-mobile" style={{ display: 'flex', padding: '0 1.5rem', opacity: 0.5, fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1 }}>Item Information & Actions</div>
              <div style={{ width: '120px', textAlign: 'right' }}>Price</div>
              <div style={{ width: '60px' }}></div>
            </div>

            <div className="cart-list flex flex-col" style={{ gap: '0.75rem' }}>
              {cart.map((item) => (
                <div key={item.cartId} className="card" style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  border: '1px solid #f1f5f9',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: '1.25rem',
                  backgroundColor: 'white'
                }}>
                  {/* Small Image - Fixed Size */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    flexShrink: 0,
                    backgroundColor: '#f8fafc',
                    borderRadius: '1rem',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Single Line Content Container */}
                  <div className="cart-item-info" style={{
                    flex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}>
                    {/* Name and Category */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>{item.name}</h3>
                        <Link
                          to={`/products/${item.id}`}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: 'var(--color-primary-light)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          View <ExternalLink size={10} />
                        </Link>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.category}</p>
                    </div>

                    {/* Price & Delete - Pushed to right on desktop */}
                    <div className="actions-price" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2rem'
                    }}>
                      <div className="cart-item-price-val">
                        {item.pricingType === 'wholesale' || item.pricingType === 'contact'
                          ? <span className="wholesale-badge">WHOLESALE</span>
                          : `₹${item.price.toLocaleString()}`
                        }
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.05)',
                          color: '#EF4444',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          border: '1px solid rgba(239, 68, 68, 0.1)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EF4444'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.color = '#EF4444'; }}
                        title="Remove Item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card Below */}
            <div className="card" style={{
              marginTop: '2rem',
              padding: '2.5rem',
              backgroundColor: 'white',
              borderRadius: '2rem',
              boxShadow: 'var(--shadow-xl)',
              border: '2px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ShoppingCart size={24} style={{ color: 'var(--color-primary)' }} /> Order Summary
                    </h2>
                    <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '450px' }}>
                      Experience the best home products with Heman Enterprises. We'll contact you for delivery details once you checkout on My Orders section.
                    </p>
                  </div>
                  <div className="cart-summary-total-box">
                    <div className="total-label">Estimated Total</div>
                    <div className="total-value">₹{cartTotal.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ height: '2px', backgroundColor: '#f1f5f9' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                  <div style={{
                    backgroundColor: '#fffbeb',
                    padding: '1rem 1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid #fef3c7',
                    flex: 1,
                    minWidth: '300px'
                  }}>
                    <p style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                      <span style={{ fontWeight: 800 }}>Note:</span> Final delivery charges as per your location will be updated in My Orders section.
                    </p>
                  </div>
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="btn btn-primary cart-checkout-btn"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-title-main { font-size: 2.5rem; font-weight: 900; }
        .wholesale-badge { font-size: 0.7rem; color: var(--color-success); background: rgba(16, 185, 129, 0.1); padding: 0.2rem 0.5rem; borderRadius: 4px; }
        .cart-item-price-val { fontSize: 1.25rem; font-weight: 900; color: var(--color-primary); text-align: right; min-width: 100px; }
        .cart-summary-total-box { text-align: right; }
        .total-label { font-size: 0.9rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem; }
        .total-value { font-size: 3.5rem; font-weight: 950; color: var(--color-primary); line-height: 1; }
        .cart-checkout-btn { padding: 1.5rem 3rem; fontSize: 1.5rem; borderRadius: 1.25rem; font-weight: 900; box-shadow: 0 20px 40px rgba(30, 58, 138, 0.2); flex: 0 0 auto; }

        @media (max-width: 768px) {
          .cart-title-main { font-size: 1.75rem !important; }
          .hidden-mobile { display: none !important; }
          .cart-item-info { flex-direction: column !important; align-items: flex-start !important; gap: 0.5rem !important; }
          .actions-price { width: 100% !important; justify-content: space-between !important; border-top: 1px solid #f1f5f9; padding-top: 0.75rem !important; }
          .cart-item-price-val { font-size: 1rem !important; text-align: left !important; min-width: unset !important; }
          .total-value { font-size: 2rem !important; }
          .cart-checkout-btn { width: 100% !important; font-size: 1.25rem !important; padding: 1rem !important; }
          .cart-summary-total-box { width: 100% !important; text-align: center !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
