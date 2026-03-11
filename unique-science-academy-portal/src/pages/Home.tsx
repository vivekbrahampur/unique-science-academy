import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, GraduationCap, BookOpen, Users, Quote, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [settings, setSettings] = useState({ 
    logo_url: '', 
    gallery_images: [], 
    testimonials: [],
    school_name: 'Unique Science Academy',
    hero_title: 'Welcome to Unique Science Academy',
    hero_subtitle: 'Empowering minds, shaping the future.',
    news_ticker: 'Admissions open for 2026-2027 | Annual Sports Meet on 15th March',
    about_title: 'Our Vision & Mission',
    about_text: 'We provide a nurturing environment that encourages students to excel academically, socially, and personally.',
    about_image: 'https://picsum.photos/seed/welcome/800/600',
    principal_name: 'Dr. A. K. Sharma',
    principal_message: 'Education is the most powerful weapon which you can use to change the world.',
    principal_image: 'https://picsum.photos/seed/principal/400/400',
    contact_address: 'Brahampur, Jale, Darbhanga, Bihar 847307',
    contact_phone: '+91 98765 43210',
    contact_email: 'info@uniquescienceacademy.in'
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (settings.gallery_images.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % settings.gallery_images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [settings.gallery_images]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-50 min-h-screen"
    >
      {/* News Ticker */}
      {settings.news_ticker && (
        <div className="bg-blue-900 text-white py-2 px-4 flex items-center border-b-4 border-yellow-500">
          <div className="bg-yellow-500 text-blue-900 font-bold px-4 py-1 rounded-sm mr-4 whitespace-nowrap uppercase text-sm tracking-wider">
            Latest News
          </div>
          <div className="overflow-hidden whitespace-nowrap relative w-full">
            <motion.div 
              animate={{ x: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="inline-block font-medium tracking-wide"
            >
              {settings.news_ticker}
            </motion.div>
          </div>
        </div>
      )}

      {/* Hero Section with Slider */}
      <section className="relative bg-slate-900 overflow-hidden h-[50vh] md:h-[65vh]">
        {settings.gallery_images.length > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            {settings.gallery_images.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                  opacity: index === currentSlide ? 1 : 0,
                  scale: index === currentSlide ? 1.05 : 1
                }}
                transition={{ 
                  opacity: { duration: 1.5 },
                  scale: { duration: 6, ease: "linear" }
                }}
                className="absolute inset-0 w-full h-full"
              >
                <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-blue-900"></div>
        )}
      </section>

      {/* School Branding & Welcome Text */}
      <section className="bg-white py-16 border-b border-slate-200 shadow-sm relative z-20 -mt-10 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            {settings.logo_url && (
              <img src={settings.logo_url} alt="School Logo" className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-xl mb-6 bg-white p-2 -mt-24" />
            )}
            <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 tracking-tight mb-4 uppercase font-serif">
              {settings.school_name}
            </h1>
            <h2 className="text-xl md:text-3xl text-yellow-600 font-bold mb-4 font-serif">
              {settings.hero_title}
            </h2>
            <p className="text-lg md:text-xl text-slate-600 font-medium max-w-3xl mx-auto tracking-wide">
              {settings.hero_subtitle}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/student/login" className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-900 text-lg font-bold rounded-full text-white bg-blue-900 hover:bg-transparent hover:text-blue-900 transition-all duration-300 shadow-lg uppercase tracking-wider">
                Student Portal
                <ChevronRight className="ml-2 h-6 w-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-yellow-400/20 transform rotate-3 rounded-3xl -z-10"></div>
              <img 
                src={settings.about_image} 
                alt="About School" 
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl border-8 border-white"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-extrabold text-blue-900 uppercase tracking-wider mb-2 font-serif">
                {settings.about_title}
              </h2>
              <div className="w-24 h-1.5 bg-yellow-500 mb-8"></div>
              
              <div className="prose prose-lg text-slate-600 mb-10">
                <p className="text-xl leading-relaxed whitespace-pre-line">
                  {settings.about_text}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <GraduationCap className="h-10 w-10 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-bold text-blue-900 mb-2 uppercase tracking-wide">Quality Education</h3>
                  <p className="text-sm text-slate-600">Comprehensive curriculum focusing on holistic development.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <Users className="h-10 w-10 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-bold text-blue-900 mb-2 uppercase tracking-wide">Expert Faculty</h3>
                  <p className="text-sm text-slate-600">Highly qualified teachers dedicated to student success.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Principal's Message Section */}
      {settings.principal_name && (
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-2 bg-blue-900 relative">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <div className="p-10 flex flex-col items-center justify-center h-full relative z-10 text-center">
                    <img 
                      src={settings.principal_image} 
                      alt={settings.principal_name} 
                      className="w-48 h-48 object-cover rounded-full border-4 border-yellow-400 shadow-lg mb-6"
                    />
                    <h3 className="text-2xl font-bold text-white mb-1 font-serif">{settings.principal_name}</h3>
                    <p className="text-yellow-400 font-medium tracking-widest uppercase text-sm">Principal</p>
                  </div>
                </div>
                <div className="md:col-span-3 p-10 md:p-16 flex flex-col justify-center relative">
                  <Quote className="absolute top-10 left-10 h-16 w-16 text-slate-100 -z-10" />
                  <h2 className="text-3xl font-extrabold text-blue-900 uppercase tracking-wider mb-6 font-serif">
                    Principal's Message
                  </h2>
                  <div className="w-16 h-1 bg-yellow-500 mb-8"></div>
                  <p className="text-lg text-slate-600 leading-relaxed italic">
                    "{settings.principal_message}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Information Section */}
      <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl uppercase font-serif">Contact Us</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700 backdrop-blur-sm text-center hover:bg-blue-800 transition-colors"
            >
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MapPin className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Our Location</h3>
              <p className="text-blue-200 whitespace-pre-line leading-relaxed">{settings.contact_address}</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700 backdrop-blur-sm text-center hover:bg-blue-800 transition-colors"
            >
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Phone className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Call Us</h3>
              <p className="text-blue-200 text-lg">{settings.contact_phone}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700 backdrop-blur-sm text-center hover:bg-blue-800 transition-colors"
            >
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Mail className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Email Us</h3>
              <p className="text-blue-200 text-lg">{settings.contact_email}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {settings.testimonials && settings.testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight sm:text-4xl uppercase">What People Say</h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">Hear from our students and parents</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {settings.testimonials.map((t: any, idx: number) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm relative"
                >
                  <Quote className="absolute top-6 right-6 h-8 w-8 text-blue-100" />
                  <p className="text-slate-600 italic mb-6 relative z-10">"{t.text}"</p>
                  <div className="flex items-center space-x-4">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-sm text-blue-600">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
