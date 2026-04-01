import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Clock, ShieldAlert, Bed, Sofa, CheckCircle, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

import { getProducts } from '../services/db';
import type { Product } from '../services/db';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    getProducts(undefined, 10)
      .then(data => {
        // Simple logic to ensure variety if we have more products
        setFeaturedProducts(data);
      })
      .catch(err => console.error(err));
  }, []);

  const categories = [
    { name: 'Bureau', icon: <Package size={32} /> },
    { name: 'Dressing Tables', icon: <Sofa size={32} /> },
    { name: 'Mattresses', icon: <Bed size={32} /> },
    { name: 'Gas Stoves', icon: <CheckCircle size={32} /> },
    { name: 'Air Coolers', icon: <ShieldCheck size={32} /> },
    { name: 'Refrigerators', icon: <Package size={32} /> },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="section flex-center"
        style={{ 
          minHeight: '85vh', 
          background: 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.6)), url("/homepage-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <div className="container animate-fade-in" style={{ maxWidth: '1280px', width: '100%', textAlign: 'left', zIndex: 10 }}>
          <div style={{ maxWidth: '750px' }}>
            <p className="mb-4" style={{ 
              fontWeight: 700, 
              letterSpacing: '0.05em', 
              fontSize: '1.25rem', 
              marginBottom: '1rem',
              color: 'var(--color-primary)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}>
              Heman Enterprises
            </p>
            <h1 className="hero-title mb-6">
              Upgrade Your <br className="mobile-only" /> 
              Home with <br className="mobile-only" /> 
              <span style={{ color: 'var(--color-accent)' }}>Trusted Quality</span>
            </h1>
            <p className="hero-description mb-8 delay-100">
              At Heman Enterprises, we bring you durable, branded home products with reliable after-sales support — trusted by families for over 20 years. Experience comfort and durability combined.
            </p>
            <div className="flex flex-wrap delay-200" style={{ gap: '1.25rem', opacity: 0, animation: 'fadeIn 0.5s ease 0.2s forwards' }}>
              <button 
                onClick={(e) => handleLinkClick(e, '/products')} 
                className="btn btn-primary hero-btn" 
              >
                Explore Products
              </button>
              <button 
                onClick={(e) => handleLinkClick(e, '/contact')} 
                className="btn hero-btn-outline" 
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

       {/* Featured Products */}
      <section className="section bg-light" style={{ padding: '5rem 0', background: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="flex-between mb-8" style={{ marginBottom: '3rem' }}>
            <h2 className="heading-lg">Featured Products</h2>
            <button 
              onClick={(e) => handleLinkClick(e, '/products')} 
              className="btn btn-outline"
            >
              View All
            </button>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted">Loading products... Make sure the backend server is running.</div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section bg-light" style={{ padding: '3rem 0', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
        <div className="container grid grid-cols-1 md-grid-cols-3" style={{ gap: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {[
            { title: 'Branded Products', icon: <ShieldCheck size={40} className="text-primary mb-4" />, desc: '100% genuine and original brands.' },
            { title: 'Long Durability', icon: <Clock size={40} className="text-primary mb-4" />, desc: 'Products tested for longevity and daily use.' },
            { title: 'Service Support', icon: <ShieldAlert size={40} className="text-primary mb-4" />, desc: 'Reliable after-sales service and maintenance.' }
          ].map((feature, i) => (
            <div key={i} className="flex-col flex-center text-center card" style={{ padding: '2rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(30, 58, 138, 0.05)', borderRadius: '50%', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                {feature.icon}
              </div>
              <h3 className="heading-sm" style={{ marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p className="text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Review */}
      <section className="section bg-light" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="text-center mb-10" style={{ marginBottom: '3rem' }}>
            <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>Shop by Category</h2>
            <p className="text-muted max-w-2xl mx-auto" style={{ maxWidth: '600px', margin: '0 auto' }}>Find precisely what you're looking for by browsing our premium collections.</p>
          </div>
          
          <div className="grid grid-cols-2 md-grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat, i) => (
              <Link to={`/products?category=${encodeURIComponent(cat.name)}`} key={i} className="card flex-col flex-center text-center" style={{ padding: '2rem 1rem', textDecoration: 'none' }}>
                <div className="mb-4" style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>{cat.icon}</div>
                <h3 className="heading-sm" style={{ fontSize: '1rem' }}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

     
    </div>
  );
}

export default Home;
