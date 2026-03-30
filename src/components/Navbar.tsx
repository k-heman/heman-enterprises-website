import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, ShoppingBag, PhoneCall, User as UserIcon, LogOut, ChevronDown, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart, addedMessage } = useCart();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLLIElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="glass sticky top-0 z-40 p-4 w-full main-navbar">
        {/* Success Message Toast */}
        {addedMessage && (
          <div className="cart-success-toast animate-fade-in-down">
            <div className="flex-center" style={{ gap: '0.5rem' }}>
              <ShoppingBag size={18} />
              <span>{addedMessage}</span>
            </div>
          </div>
        )}

        <div className="container flex-between">
          {/* LEFT SIDE: Hamburger (Mobile) + Logo */}
          <div className="flex-center" style={{ gap: '1rem' }}>
            <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
              <Menu size={28} />
            </button>

            <Link to="/" className="flex-center logo-link" style={{ gap: '0.5rem' }}>
              <img
                src="/image.png"
                alt="Logo"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
              <span className="heading-sm text-primary mobile-hidden" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                Heman Enterprises
              </span>
            </Link>
          </div>

          {/* RIGHT SIDE: Desktop Menu */}
          <div className="desktop-menu-container">
            <ul className="flex" style={{ gap: '2rem', alignItems: 'center' }}>
              {user ? (
                <>
                  <li><Link to="/products" className="nav-link">All Products</Link></li>
                  {user.role === 'admin' ? (
                    <>
                      <li><Link to="/admin" className="nav-link">Admin Dashboard</Link></li>
                      <li><Link to="/admin/orders" className="nav-link">Orders</Link></li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/about" className="nav-link">About Us</Link></li>
                      <li><Link to="/contact" className="nav-link">Contact Us</Link></li>
                      <li><Link to="/my-orders" className="nav-link">My Orders</Link></li>
                      <li>
                        <Link to="/cart" className="cart-btn flex-center" aria-label="View Cart">
                          <ShoppingCart size={22} color="var(--color-primary)" />
                          {cart.length > 0 && (
                            <span className="cart-badge">{cart.length}</span>
                          )}
                        </Link>
                      </li>
                    </>
                  )}
                  <li style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="user-profile-btn flex-center"
                    >
                      <div className="user-avatar flex-center">
                        <UserIcon size={18} />
                      </div>
                      <span className="user-name">{user.name}</span>
                      <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {dropdownOpen && (
                      <div className="card user-dropdown animate-fade-in-down" style={{ zIndex: 2000 }}>
                        <ul>
                          <li>
                            <button onClick={handleLogout} className="dropdown-item logout-btn">
                              <LogOut size={18} /> Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                </>
              ) : (
                <li><Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Login</Link></li>
              )}
            </ul>
          </div>

          {/* RIGHT SIDE: Mobile Cart ONLY (Hamburger moved to left) */}
          <div className="mobile-cart-container flex-center">
            {user && user.role !== 'admin' && (
              <Link to="/cart" className="cart-btn" aria-label="View Cart">
                <ShoppingCart size={24} />
                {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 📱 MOBILE SIDEBAR (GEMINI STYLE) */}

      {/* Dark Overlay (Clicks outside close the menu) */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleMenu}></div>
      )}

      {/* Sliding Drawer */}
      <div className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header flex-between">
          <span className="heading-sm text-primary" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            Menu
          </span>
          <button onClick={toggleMenu} className="close-btn" aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-content">
          <ul className="flex-col" style={{ gap: '0.5rem' }}>
            <li><Link to="/" onClick={toggleMenu} className="mobile-nav-link"><Home size={20} /> Home</Link></li>
            {user ? (
              <>
                <li><Link to="/products" onClick={toggleMenu} className="mobile-nav-link"><ShoppingBag size={20} /> All Products</Link></li>
                {user.role === 'admin' ? (
                  <>
                    <li><Link to="/admin" onClick={toggleMenu} className="mobile-nav-link admin-text"><ShieldCheck size={20} /> Admin Dashboard</Link></li>
                    <li><Link to="/admin/orders" onClick={toggleMenu} className="mobile-nav-link admin-text"><ShoppingBag size={20} /> Orders</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/about" onClick={toggleMenu} className="mobile-nav-link"><UserIcon size={20} /> About Us</Link></li>
                    <li><Link to="/contact" onClick={toggleMenu} className="mobile-nav-link"><PhoneCall size={20} /> Contact Us</Link></li>
                    <li><Link to="/my-orders" onClick={toggleMenu} className="mobile-nav-link"><ShoppingBag size={20} /> My Orders</Link></li>
                    <li><Link to="/cart" onClick={toggleMenu} className="mobile-nav-link"><ShoppingCart size={20} /> Cart</Link></li>
                  </>
                )}
                <div className="divider"></div>
                <li className="mobile-user-info">Logged in as {user.name}</li>
                <li style={{ marginTop: '0.5rem' }}>
                  <button onClick={() => { handleLogout(); toggleMenu(); }} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <div className="divider"></div>
                <li><Link to="/login" onClick={toggleMenu} className="mobile-nav-link"><UserIcon size={20} /> Login</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* ALL CSS STYLES INCLUDED HERE */}
      <style>{`
        .main-navbar {
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .desktop-menu-container { 
          display: none; 
        }
        .mobile-toggle { 
          background: transparent; 
          border: none; 
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        /* SIDEBAR CSS (The Magic) */
        .sidebar-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(2px);
          z-index: 998;
          animation: fadeIn 0.3s ease;
        }
        .sidebar-drawer {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 280px;
          background: white;
          z-index: 999;
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 25px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
        }
        .sidebar-drawer.open {
          transform: translateX(0);
        }
        .sidebar-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
        }
        .sidebar-content {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        /* Nav Link Styles */
        .nav-link { 
          font-weight: 600; 
          font-family: 'Inter', sans-serif; 
          position: relative; 
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        .nav-link:hover { 
          color: var(--color-primary); 
        }
        .nav-link::after { 
          content: ''; 
          position: absolute; 
          width: 0; 
          height: 2px; 
          bottom: -4px; 
          left: 0; 
          background-color: var(--color-primary); 
          transition: width 0.3s; 
        }
        .nav-link:hover::after { 
          width: 100%; 
        }
        
        /* User Profile & Dropdown */
        .user-profile-btn {
          background: rgba(30, 58, 138, 0.05);
          padding: 0.4rem 0.8rem;
          border-radius: 2rem;
          gap: 0.6rem;
          transition: all 0.2s;
          border: 1px solid rgba(30, 58, 138, 0.1);
        }
        .user-profile-btn:hover {
          background: rgba(30, 58, 138, 0.1);
        }
        .user-avatar {
          background: var(--color-primary);
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
        }
        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--color-primary);
        }
        .chevron-icon {
          color: var(--text-muted);
          transition: transform 0.3s;
        }
        .chevron-icon.rotate {
          transform: rotate(180deg);
        }
        .user-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          min-width: 220px;
          padding: 0.5rem;
          z-index: 100;
          box-shadow: var(--shadow-xl);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .dropdown-item:hover {
          background: rgba(30, 58, 138, 0.05);
          color: var(--color-primary);
        }
        .logout-btn {
          width: 100%;
          border: none;
          background: transparent;
          color: #EF4444;
          cursor: pointer;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.05);
          color: #B91C1C;
        }

        /* Mobile Sidebar Link Styles */
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          color: var(--text-main);
          transition: all 0.2s;
        }
        .mobile-nav-link:hover {
          background: rgba(30, 58, 138, 0.05);
          color: var(--color-primary);
        }
        .divider {
          height: 1px;
          background: rgba(0,0,0,0.05);
          margin: 0.5rem 0;
        }
        .mobile-user-info {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .admin-text {
          color: var(--color-primary);
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Cart Styles */
        .cart-btn {
          background: transparent;
          border: none;
          padding: 0.5rem;
          position: relative;
          cursor: pointer;
          color: var(--color-primary);
        }
        .cart-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #EF4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid white;
        }
        .cart-success-toast {
          position: fixed;
          top: 85px;
          left: 50%;
          transform: translateX(-50%);
          background: #10B981;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          pointer-events: none;
        }

        /* Media Queries */
        @media (min-width: 768px) {
          .desktop-menu-container { display: block; }
          .mobile-toggle { display: none; }
          .mobile-hidden { display: inline; }
          .mobile-cart-container { display: none; }
        }
        @media (max-width: 767px) {
          .mobile-hidden { display: none; }
        }
      `}</style>
    </>
  );
}

export default Navbar;