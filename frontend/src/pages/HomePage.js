import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Award, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [landingSettings, setLandingSettings] = useState(null);
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchLandingSettings();
  }, []);

  const fetchLandingSettings = async () => {
    try {
      const response = await axios.get(`${API}/landing-page`);
      setLandingSettings(response.data);
    } catch (error) {
      console.error('Error fetching landing settings:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products/featured`);
      setFeaturedProducts(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Truck size={32} />,
      title: 'Free Shipping',
      description: 'On orders above ₹999'
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure Payment',
      description: '100% protected transactions'
    },
    {
      icon: <Award size={32} />,
      title: 'Premium Quality',
      description: 'Handpicked finest fabrics'
    },
    {
      icon: <ShoppingBag size={32} />,
      title: 'Easy Returns',
      description: '7-day hassle-free returns'
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />
      
      {/* Hero Section with Fade */}
      <motion.section 
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background Media */}
        {landingSettings?.hero_media ? (
          <div className="absolute inset-0 z-0">
            {landingSettings.hero_media_type === 'video' ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={landingSettings.hero_media} type="video/mp4" />
              </video>
            ) : (
              <img
                src={landingSettings.hero_media}
                alt="Hero"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          </div>
        ) : (
          <>
            {/* Default Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-[#faf8f5] to-beige-100" />
            
            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute top-20 right-20 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"
            />
          </>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Sparkles className={`${landingSettings?.hero_media ? 'text-white' : 'text-emerald-600'}`} size={24} />
              <span className={`text-sm font-semibold tracking-wider uppercase ${landingSettings?.hero_media ? 'text-white' : 'text-emerald-600'}`}>
                Premium Quality
              </span>
              <Sparkles className={`${landingSettings?.hero_media ? 'text-white' : 'text-emerald-600'}`} size={24} />
            </motion.div>
            
            <h1 
              className={`text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 playfair ${landingSettings?.hero_media ? 'text-white drop-shadow-2xl' : ''}`}
              data-testid="hero-title"
            >
              {landingSettings?.hero_title ? (
                <>
                  {landingSettings.hero_title.split(' ').slice(0, -1).join(' ')}{' '}
                  <span className={landingSettings?.hero_media ? 'text-emerald-400' : 'gradient-text'}>
                    {landingSettings.hero_title.split(' ').slice(-1)}
                  </span>
                </>
              ) : (
                <>
                  Welcome to <span className="gradient-text">Rishè</span>
                </>
              )}
            </h1>
            <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${landingSettings?.hero_media ? 'text-white drop-shadow-lg' : 'text-gray-600'}`}>
              {landingSettings?.hero_subtitle || "Elevate your style with our premium collection of handcrafted shirts. Where elegance meets comfort."}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/products')}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                data-testid="shop-now-btn"
              >
                Shop Now
                <ArrowRight size={24} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/products')}
                className={`btn-secondary text-lg px-8 py-4 ${landingSettings?.hero_media ? 'bg-white/90 hover:bg-white border-white text-gray-900' : ''}`}
                data-testid="explore-collection-btn"
              >
                Explore Collection
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className={`w-6 h-10 border-2 ${landingSettings?.hero_media ? 'border-white' : 'border-emerald-600'} rounded-full flex justify-center`}>
            <div className={`w-1.5 h-3 ${landingSettings?.hero_media ? 'bg-white' : 'bg-emerald-600'} rounded-full mt-2`} />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl hover:bg-emerald-50 transition-colors duration-300"
                data-testid={`feature-${index}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-emerald-100 text-emerald-600 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 playfair">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#faf8f5]" data-testid="featured-products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 playfair">
              Featured Collection
            </h2>
            <p className="text-gray-600 text-lg">Discover our handpicked favorites</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                  data-testid={`featured-product-${index}`}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={product.images[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 playfair">{product.name}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-emerald-600">₹{product.price}</span>
                        <span className="text-sm text-gray-500">{product.variants?.length} colors</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="btn-secondary inline-flex items-center gap-2"
              data-testid="view-all-products-btn"
            >
              View All Products
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 playfair">
              Ready to Upgrade Your Wardrobe?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers who trust Rishè for premium quality shirts.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300"
              data-testid="cta-shop-btn"
            >
              Start Shopping
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;