import React, { useState, useEffect } from 'react';
import { getOrders, updateOrder } from '../services/db';
import type { Order } from '../services/db';
import { ShoppingBag, Phone, MapPin, Package, Search, RefreshCw } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, field: 'status' | 'deliveryStatus' | 'deliveryDate', value: string) => {
    setUpdatingId(id);
    try {
      await updateOrder(id, { [field]: value });
      setOrders(prev => prev.map(order =>
        order.id === id ? { ...order, [field]: value } : order
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => order && (
    (order.fullName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (order.productName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (order.mobile || '').includes(searchTerm || '')
  ));

  const getBadgeStyle = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'cancelled') return { background: '#e5e7eb', color: '#4b5563' }; // Gray
    if (s === 'available' || s === 'accepted' || s === 'delivered') return { background: '#d1fae5', color: '#047857' }; // Green
    return { background: '#ffedd5', color: '#c2410c' }; // Orange/Pending
  };

  if (loading && orders.length === 0) {
    return (
      <div className="custom-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <p style={{ color: '#6b7280', fontSize: '1.2rem' }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="custom-container">

        {/* Header Section */}
        <div className="page-header">
          <div className="header-title-block">
            <h1 className="page-title">
              <ShoppingBag size={28} style={{ color: '#1e3a8a', marginRight: '10px' }} />
              Customer Orders
            </h1>
            <p className="page-subtitle">Manage and track your customer purchase requests.</p>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, product or mobile..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchOrders} className="refresh-btn">
              <RefreshCw size={18} className={loading ? 'spinning' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <Package size={64} style={{ color: '#d1d5db', marginBottom: '16px' }} />
            <h3>No orders found</h3>
            <p>Once customers place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order.id} className="custom-order-card">

                {/* Status Badge */}
                <div className="card-badge" style={getBadgeStyle(order.status || 'pending')}>
                  {order.status || 'PENDING'}
                </div>

                <div className="card-content-flex">

                  {/* Column 1: Image */}
                  <div className="col-image">
                    <div className="img-wrapper">
                      <img
                        src={order.productImage || '/logo.png'}
                        alt={order.productName}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                      />
                    </div>
                  </div>

                  {/* Column 2: Details */}
                  <div className="col-details">
                    <h3 className="customer-name">{order.fullName || 'Unknown Customer'}</h3>
                    <h4 className="product-name">{order.productName || 'Unknown Product'}</h4>
                    <p className="order-qty">Quantity: {order.quantity || 1}</p>

                    <div className="order-meta">
                      <p>Order ID: {(order.id || '').slice(-6).toUpperCase() || 'N/A'}</p>
                      <p>{order?.createdAt ? `${new Date(order.createdAt).toLocaleDateString()} @ ${new Date(order.createdAt).toLocaleTimeString()}` : 'Date Unknown'}</p>
                      
                      {order.status === 'cancelled' && (
                        <div className="admin-cancel-reason" style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff1f2', border: '1px solid #ffe4e6', borderRadius: '8px' }}>
                          <p style={{ color: '#be123c', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {order.cancelledBy === 'user' ? '⚠️ User Cancelled' : 'Admin Cancelled'}
                          </p>
                          <p style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500, fontStyle: 'italic', margin: 0 }}>
                            "{order.cancelReason || 'No reason provided'}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="col-divider"></div>

                  {/* Column 3: Contact & Shipping */}
                  <div className="col-shipping">
                    <div className="info-block">
                      <label className="section-label">CONTACT DETAILS</label>
                      <div className="icon-text">
                        <Phone size={16} color="#9ca3af" />
                        <a href={`tel:${order.mobile}`}>{order.mobile}</a>
                      </div>
                    </div>

                    <div className="info-block">
                      <label className="section-label">SHIPPING DESTINATION</label>
                      <div className="icon-text align-start">
                        <MapPin size={16} color="#9ca3af" style={{ marginTop: '3px' }} />
                        <span>
                          {order.address?.village || 'N/A'}, {order.address?.mandal || 'N/A'}<br />
                          {order.address?.district || 'N/A'}, {order.address?.state || 'N/A'}<br />
                          — {order.address?.pincode || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="col-divider"></div>

                  {/* Column 4: Controls */}
                  <div className="col-controls">
                    <div className="control-group">
                      <label>Order Status</label>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(order.id, 'status', e.target.value)}
                        disabled={updatingId === order.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="not available">Not Available</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="control-group">
                      <label>Delivery Status</label>
                      <select
                        value={order.deliveryStatus || 'pending'}
                        onChange={(e) => handleStatusUpdate(order.id, 'deliveryStatus', e.target.value)}
                        disabled={updatingId === order.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="available">Available</option>
                        <option value="not available">Not Available</option>
                        <option value="shipping">Shipping</option>
                        <option value="ready for delivery">Ready for delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="control-group">
                      <label>Delivery Date (Calendar)</label>
                      <input
                        type="date"
                        value={order.deliveryDate || ''}
                        onChange={(e) => handleStatusUpdate(order.id, 'deliveryDate', e.target.value)}
                      />
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BULLETPROOF CSS STYLES */}
      <style>{`
        .admin-orders-page {
          background-color: #f8fafc;
          min-height: 100vh;
          padding: 2rem 1rem;
          font-family: system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
        }
        
        .custom-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e3a8a;
          display: flex;
          align-items: center;
          margin: 0 0 0.25rem 0;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          width: auto;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
        }

        .search-input {
          padding: 0.6rem 1rem 0.6rem 2.2rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          min-width: 300px;
          font-size: 0.9rem;
        }
        
        .search-input:focus {
          border-color: #ea580c;
        }

        .refresh-btn {
          background-color: #ea580c;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .refresh-btn:hover { background-color: #c2410c; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .empty-state {
          background: white;
          text-align: center;
          padding: 4rem 2rem;
          border-radius: 16px;
          border: 2px dashed #e2e8f0;
          color: #64748b;
        }

        .orders-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .custom-order-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          position: relative;
        }

        .card-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-content-flex {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        .col-image {
          flex-shrink: 0;
        }

        .img-wrapper {
          width: 140px;
          height: 140px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .img-wrapper img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .col-details {
          flex: 1.2;
          min-width: 180px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .customer-name { margin: 0 0 4px 0; font-size: 1.3rem; font-weight: 800; color: #0f172a; }
        .product-name { margin: 0 0 8px 0; font-size: 1rem; font-weight: 600; color: #334155; }
        .order-qty { margin: 0 0 16px 0; font-size: 0.85rem; font-weight: 600; color: #64748b; }
        .order-meta p { margin: 0 0 4px 0; font-size: 0.8rem; color: #94a3b8; font-weight: 500; }

        .col-divider {
          width: 1px;
          background-color: #f1f5f9;
          align-self: stretch;
        }

        .col-shipping {
          flex: 1.5;
          min-width: 220px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          justify-content: center;
        }

        .section-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .icon-text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #334155;
          font-weight: 600;
        }
        
        .icon-text a { color: #1e3a8a; text-decoration: none; }
        .icon-text a:hover { text-decoration: underline; }
        .align-start { align-items: flex-start; line-height: 1.5; }

        .col-controls {
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .control-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 4px;
        }

        .control-group select, .control-group input {
          width: 100%;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          cursor: pointer;
        }

        .control-group select:focus, .control-group input:focus {
          border-color: #3b82f6;
          background: white;
        }

        /* Responsive Mobile Layout */
        @media (max-width: 1024px) {
          .card-content-flex {
            flex-direction: column;
            gap: 1.5rem;
          }
          .col-divider {
            display: none;
          }
          .col-image, .col-details, .col-shipping, .col-controls {
            width: 100%;
          }
          .col-controls {
            border-top: 1px solid #f1f5f9;
            padding-top: 1.5rem;
          }
          .header-actions {
            width: 100%;
          }
          .search-box, .search-input {
            width: 100%;
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;