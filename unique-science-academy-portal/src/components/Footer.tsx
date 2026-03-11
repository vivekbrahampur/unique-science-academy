import { useEffect, useState } from 'react';

export default function Footer() {
  const [contact, setContact] = useState({
    address: 'Brahampur, Jale\nDarbhanga, Bihar 847307',
    email: 'info@uniquescienceacademy.in',
    phone: '+91 98765 43210'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.contact_address || data.contact_email || data.contact_phone) {
          setContact({
            address: data.contact_address || contact.address,
            email: data.contact_email || contact.email,
            phone: data.contact_phone || contact.phone
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 py-8 border-t-4 border-blue-800 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4 uppercase tracking-wider">Unique Science Academy</h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Providing quality education and fostering a culture of excellence in Brahampur, Jale, Darbhanga.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-yellow-400 transition-colors">Home</a></li>
              <li><a href="/student/login" className="hover:text-yellow-400 transition-colors">Student Portal</a></li>
              <li><a href="/admin/login" className="hover:text-yellow-400 transition-colors">Admin Login</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4 uppercase tracking-wider">Contact Us</h3>
            <address className="not-italic text-sm text-slate-400 space-y-2">
              {contact.address.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
              <p>Email: {contact.email}</p>
              <p>Phone: {contact.phone}</p>
            </address>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Unique Science Academy, Brahampur. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
