import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, FileSpreadsheet, Image as ImageIcon, FileQuestion, LogOut, CheckCircle, Shield, Mail, UserCheck } from 'lucide-react';

const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function useAdminFetch() {
  const navigate = useNavigate();
  return async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('adminToken');
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      throw new Error('Unauthorized');
    }
    return res;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminFetch = useAdminFetch();
  const [activeTab, setActiveTab] = useState('registration');
  const [students, setStudents] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/admin/login');
    }
    fetchStudents();
  }, [navigate]);

  const fetchStudents = async () => {
    try {
      const res = await adminFetch('/api/admin/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-blue-900 text-white shadow-xl">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-xl font-bold uppercase tracking-wider">Admin Panel</h2>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('registration')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'registration' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <UserPlus className="h-5 w-5" />
            <span>Quick Registration</span>
          </button>
          <button
            onClick={() => setActiveTab('full_registration')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'full_registration' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <UserCheck className="h-5 w-5" />
            <span>Full Registration</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'results' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <FileSpreadsheet className="h-5 w-5" />
            <span>Result Management</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'content' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <ImageIcon className="h-5 w-5" />
            <span>Content Control</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'tests' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <FileQuestion className="h-5 w-5" />
            <span>Online Test Panel</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </button>
          <button
            onClick={() => setActiveTab('email_settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'email_settings' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <Mail className="h-5 w-5" />
            <span>Email Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors mt-8 text-red-200 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {successMsg && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center shadow-sm">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-sm text-green-700 font-medium">{successMsg}</p>
          </div>
        )}

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'registration' && <RegistrationTab onSuccess={() => { showSuccess('Student registered successfully'); fetchStudents(); }} />}
          {activeTab === 'full_registration' && <FullRegistrationTab onSuccess={() => { showSuccess('Student full registration successful. Confirmation email sent.'); fetchStudents(); }} />}
          {activeTab === 'results' && <ResultsTab students={students} onSuccess={() => showSuccess('Result added successfully')} />}
          {activeTab === 'content' && <ContentTab onSuccess={() => showSuccess('Content updated successfully')} />}
          {activeTab === 'tests' && <TestsTab onSuccess={() => showSuccess('Question added successfully')} />}
          {activeTab === 'security' && <SecurityTab onSuccess={() => showSuccess('Credentials updated successfully')} />}
          {activeTab === 'email_settings' && <EmailSettingsTab onSuccess={() => showSuccess('Email settings updated successfully')} />}
        </motion.div>
      </main>
    </div>
  );
}

const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SUBJECTS = ['Hindi', 'English', 'Math', 'SST', 'Science'];

function RegistrationTab({ onSuccess }: { onSuccess: () => void }) {
  const adminFetch = useAdminFetch();
  const [formData, setFormData] = useState({ name: '', father_name: '', class_name: '1', roll_no: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
        setFormData({ name: '', father_name: '', class_name: '1', roll_no: '' });
      } else {
        alert('Failed to register student. Roll number might already exist for this class.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Quick Student Registration</h3>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Student Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Father's Name</label>
            <input required type="text" value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
            <select required value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              {CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Roll Number</label>
            <input required type="text" value={formData.roll_no} onChange={e => setFormData({...formData, roll_no: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <button type="submit" className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm">Register Student</button>
      </form>
    </div>
  );
}

function ResultsTab({ students, onSuccess }: { students: any[], onSuccess: () => void }) {
  const adminFetch = useAdminFetch();
  const [studentId, setStudentId] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [marksData, setMarksData] = useState<Record<string, {marks: string, total: string}>>(
    SUBJECTS.reduce((acc, sub) => ({ ...acc, [sub]: { marks: '', total: '100' } }), {})
  );

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setIsPublished(!!data.results_published);
      })
      .catch(console.error);
  }, [adminFetch]);

  const handlePublishToggle = async () => {
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results_published: !isPublished })
      });
      if (res.ok) {
        setIsPublished(!isPublished);
        alert(`Results have been ${!isPublished ? 'published' : 'unpublished'} successfully.`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update publish status.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    
    const results = SUBJECTS.map(sub => ({
      subject: sub,
      marks: marksData[sub].marks,
      total_marks: marksData[sub].total
    }));

    try {
      const res = await adminFetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, results })
      });
      if (res.ok) {
        onSuccess();
        setStudentId('');
        setMarksData(SUBJECTS.reduce((acc, sub) => ({ ...acc, [sub]: { marks: '', total: '100' } }), {}));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-slate-800">Publish All Results</h3>
        </div>
        <p className="text-slate-600 mb-6">
          Currently, results are <strong>{isPublished ? 'Published' : 'Hidden'}</strong>. 
          When published, all students from Nursery to 10th grade will be able to view their final exam results in their portal.
        </p>
        <button 
          onClick={handlePublishToggle}
          className={`px-6 py-3 rounded-lg font-medium transition-colors shadow-sm ${isPublished ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
          {isPublished ? 'Unpublish Results' : 'Publish All Results'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Upload Marks</h3>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Student</label>
            <select required value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Class: {s.class_name}, Roll: {s.roll_no})</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 font-bold text-slate-700 border-b pb-2">
              <div>Subject</div>
              <div>Marks Obtained</div>
              <div>Total Marks</div>
            </div>
            {SUBJECTS.map(sub => (
              <div key={sub} className="grid grid-cols-3 gap-4 items-center">
                <div className="font-medium text-slate-800">{sub}</div>
                <input required type="number" min="0" max={marksData[sub].total} value={marksData[sub].marks} onChange={e => setMarksData({...marksData, [sub]: { ...marksData[sub], marks: e.target.value }})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                <input required type="number" min="1" value={marksData[sub].total} onChange={e => setMarksData({...marksData, [sub]: { ...marksData[sub], total: e.target.value }})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              </div>
            ))}
          </div>
          
          <button type="submit" className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm">Upload Result</button>
        </form>
      </div>
    </div>
  );
}

function ContentTab({ onSuccess }: { onSuccess: () => void }) {
  const adminFetch = useAdminFetch();
  const [logoUrl, setLogoUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [contactAddress, setContactAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [newsTicker, setNewsTicker] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [aboutImage, setAboutImage] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [principalMessage, setPrincipalMessage] = useState('');
  const [principalImage, setPrincipalImage] = useState('');

  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', text: '', image: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setLogoUrl(data.logo_url || '');
        setGalleryImages(data.gallery_images || []);
        setTestimonials(data.testimonials || []);
        setContactAddress(data.contact_address || '');
        setContactEmail(data.contact_email || '');
        setContactPhone(data.contact_phone || '');
        setSchoolName(data.school_name || '');
        setHeroTitle(data.hero_title || '');
        setHeroSubtitle(data.hero_subtitle || '');
        setNewsTicker(data.news_ticker || '');
        setAboutTitle(data.about_title || '');
        setAboutText(data.about_text || '');
        setAboutImage(data.about_image || '');
        setPrincipalName(data.principal_name || '');
        setPrincipalMessage(data.principal_message || '');
        setPrincipalImage(data.principal_image || '');
      });
  }, []);

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    let processed = 0;

    Array.from(files).forEach(async (file: File) => {
      try {
        const compressedImage = await compressImage(file);
        newImages.push(compressedImage);
        processed++;
        if (processed === files.length) {
          setGalleryImages(prev => [...prev, ...newImages]);
        }
      } catch (error) {
        console.error("Error compressing image:", error);
        processed++;
        if (processed === files.length) {
          setGalleryImages(prev => [...prev, ...newImages]);
        }
      }
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTestimonial = () => {
    if (newTestimonial.name && newTestimonial.text) {
      setTestimonials(prev => [...prev, { ...newTestimonial, id: Date.now() }]);
      setNewTestimonial({ name: '', role: '', text: '', image: '' });
    }
  };

  const removeTestimonial = (id: number) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          logo_url: logoUrl, 
          gallery_images: galleryImages,
          testimonials,
          contact_address: contactAddress,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          school_name: schoolName,
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          news_ticker: newsTicker,
          about_title: aboutTitle,
          about_text: aboutText,
          about_image: aboutImage,
          principal_name: principalName,
          principal_message: principalMessage,
          principal_image: principalImage
        })
      });
      if (res.ok) onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Website Content Control</h3>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-800 border-b pb-2">General Settings</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">School Name</label>
            <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">School Logo (Upload Image)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const compressedImage = await compressImage(file, 400, 400);
                    setLogoUrl(compressedImage);
                  } catch (error) {
                    console.error("Error compressing logo:", error);
                  }
                }
              }} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50" 
            />
            {logoUrl && <img src={logoUrl} alt="Logo Preview" className="mt-4 h-24 object-contain border p-2 rounded bg-slate-50" />}
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h4 className="text-lg font-bold text-slate-800 border-b pb-2">Hero Section (Top Banner)</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hero Title</label>
            <input type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hero Subtitle</label>
            <input type="text" value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">News Ticker (Scrolling Text)</label>
            <input type="text" value={newsTicker} onChange={e => setNewsTicker(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Hero Background Images (Upload Multiple)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              onChange={handleGalleryUpload}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50" 
            />
            {galleryImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Gallery ${idx}`} className="h-24 w-full object-cover border rounded-lg" />
                    <button 
                      type="button" 
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h4 className="text-lg font-bold text-slate-800 border-b pb-2">About / Welcome Section</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">About Title</label>
            <input type="text" value={aboutTitle} onChange={e => setAboutTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">About Text</label>
            <textarea rows={4} value={aboutText} onChange={e => setAboutText(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">About Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const compressedImage = await compressImage(file, 800, 600);
                    setAboutImage(compressedImage);
                  } catch (error) {
                    console.error("Error compressing about image:", error);
                  }
                }
              }} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50" 
            />
            {aboutImage && <img src={aboutImage} alt="About Preview" className="mt-4 h-32 object-cover border p-2 rounded bg-slate-50" />}
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h4 className="text-lg font-bold text-slate-800 border-b pb-2">Principal's Message</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Principal's Name</label>
            <input type="text" value={principalName} onChange={e => setPrincipalName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea rows={4} value={principalMessage} onChange={e => setPrincipalMessage(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Principal's Photo</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const compressedImage = await compressImage(file, 400, 400);
                    setPrincipalImage(compressedImage);
                  } catch (error) {
                    console.error("Error compressing principal image:", error);
                  }
                }
              }} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50" 
            />
            {principalImage && <img src={principalImage} alt="Principal Preview" className="mt-4 h-32 object-cover border p-2 rounded bg-slate-50" />}
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Testimonials</h4>
          
          {/* Existing Testimonials */}
          {testimonials.length > 0 && (
            <div className="space-y-4 mb-6">
              {testimonials.map(t => (
                <div key={t.id} className="flex items-start justify-between bg-slate-50 p-4 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    {t.image && <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />}
                    <div>
                      <p className="font-bold text-slate-800">{t.name} <span className="text-sm font-normal text-slate-500">({t.role})</span></p>
                      <p className="text-sm text-slate-600 italic">"{t.text}"</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeTestimonial(t.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Testimonial */}
          <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
            <h5 className="font-medium text-slate-700">Add New Testimonial</h5>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Name" value={newTestimonial.name} onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              <input type="text" placeholder="Role (e.g. Parent, Student)" value={newTestimonial.role} onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <textarea placeholder="Testimonial text..." value={newTestimonial.text} onChange={e => setNewTestimonial({...newTestimonial, text: e.target.value})} className="w-full px-3 py-2 border rounded-md" rows={3}></textarea>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Profile Image (Optional)</label>
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const compressedImage = await compressImage(file, 200, 200);
                    setNewTestimonial({...newTestimonial, image: compressedImage});
                  } catch (error) {
                    console.error("Error compressing testimonial image:", error);
                  }
                }
              }} className="text-sm" />
            </div>
            <button type="button" onClick={addTestimonial} className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-900">Add Testimonial</button>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Contact Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <textarea rows={3} value={contactAddress} onChange={e => setContactAddress(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Brahampur, Jale..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="info@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm">Update Content</button>
      </form>
    </div>
  );
}

function SecurityTab({ onSuccess }: { onSuccess: () => void }) {
  const adminFetch = useAdminFetch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        onSuccess();
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Update Admin Credentials</h3>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">New Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Leave blank to keep current" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Leave blank to keep current" />
        </div>
        <button type="submit" className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm">Update Credentials</button>
      </form>
    </div>
  );
}
function TestsTab({ onSuccess }: { onSuccess: () => void }) {
  const adminFetch = useAdminFetch();
  const [formData, setFormData] = useState({ class_name: '1', subject: '', title: '', link: '' });
  const [testLinks, setTestLinks] = useState<any[]>([]);
  const [marksData, setMarksData] = useState({ class_name: '1', roll_no: '', test_title: '', score: '', total: '' });

  const fetchTestLinks = async () => {
    try {
      const res = await adminFetch('/api/admin/test-links');
      const data = await res.json();
      setTestLinks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTestLinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/test-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
        setFormData({ ...formData, subject: '', title: '', link: '' });
        fetchTestLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this test link?')) return;
    try {
      const res = await adminFetch(`/api/admin/test-links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTestLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/online-test-marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marksData)
      });
      if (res.ok) {
        alert('Marks added successfully!');
        setMarksData({ ...marksData, roll_no: '', score: '' });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add marks');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Add Online Test Link</h3>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
              <select required value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                {CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
              <input required type="text" placeholder="e.g. Mathematics" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Test Title</label>
            <input required type="text" placeholder="e.g. Mid-Term Exam" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Google Form / Script Link</label>
            <input required type="url" placeholder="https://docs.google.com/forms/..." value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <button type="submit" className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm">Add Test Link</button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Manage Test Links</h3>
        {testLinks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Link</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {testLinks.map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{test.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{test.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{test.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href={test.link} target="_blank" rel="noopener noreferrer" className="hover:underline">View Link</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(test.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No test links added yet.</p>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Add Student Test Result</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h4 className="font-bold text-blue-900 mb-2">Automate with Google Forms</h4>
          <p className="text-sm text-blue-800 mb-2">
            You can automatically receive scores from Google Forms by adding this Apps Script to your form:
          </p>
          <div className="bg-slate-900 text-slate-300 p-4 rounded-md text-xs overflow-x-auto font-mono">
<pre>{`function onSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  
  // Adjust these indices based on your form's question order
  var className = itemResponses[0].getResponse(); 
  var rollNo = itemResponses[1].getResponse();
  
  var score = 0;
  var total = 0;
  
  // Calculate score (assuming quiz mode is enabled)
  var items = formResponse.getGradableItemResponses();
  for (var i = 0; i < items.length; i++) {
    score += items[i].getScore() || 0;
    total += 1; // Or get max score per item
  }

  var payload = {
    "class_name": className,
    "roll_no": rollNo,
    "test_title": FormApp.getActiveForm().getTitle(),
    "score": score.toString(),
    "total": total.toString()
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  // Replace YOUR_APP_URL with your actual website URL
  UrlFetchApp.fetch("YOUR_APP_URL/api/webhook/test-result", options);
}`}</pre>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-6 font-bold border-b pb-2">Or Add Manually:</p>
        <form onSubmit={handleMarksSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
              <select required value={marksData.class_name} onChange={e => setMarksData({...marksData, class_name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                {CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Roll Number</label>
              <input required type="text" placeholder="e.g. 101" value={marksData.roll_no} onChange={e => setMarksData({...marksData, roll_no: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Test Title</label>
            <input required type="text" placeholder="e.g. Maths Mid Term" value={marksData.test_title} onChange={e => setMarksData({...marksData, test_title: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Marks Obtained</label>
              <input required type="text" placeholder="e.g. 18" value={marksData.score} onChange={e => setMarksData({...marksData, score: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Marks</label>
              <input required type="text" placeholder="e.g. 20" value={marksData.total} onChange={e => setMarksData({...marksData, total: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm">Add Result</button>
        </form>
      </div>
    </div>
  );
}

function EmailSettingsTab({ onSuccess }: { onSuccess: () => void }) {
  const adminFetch = useAdminFetch();
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: ''
  });

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port || '',
          smtp_user: data.smtp_user || '',
          smtp_pass: data.smtp_pass || ''
        });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Email Settings (SMTP)</h3>
      <p className="text-sm text-slate-500 mb-6">Configure your email server to send automatic confirmation emails to students.</p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-bold text-blue-900 mb-2">Using Gmail?</h4>
        <p className="text-sm text-blue-800">
          If you are using Gmail, you must use an <strong>App Password</strong> instead of your regular password. 
          Go to your Google Account Settings {'>'} Security {'>'} 2-Step Verification {'>'} App Passwords to generate one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Host</label>
            <input type="text" placeholder="smtp.gmail.com" value={settings.smtp_host} onChange={e => setSettings({...settings, smtp_host: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Port</label>
            <input type="text" placeholder="587" value={settings.smtp_port} onChange={e => setSettings({...settings, smtp_port: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address (SMTP User)</label>
            <input type="email" placeholder="admin@school.com" value={settings.smtp_user} onChange={e => setSettings({...settings, smtp_user: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">App Password (SMTP Pass)</label>
            <input type="password" placeholder="••••••••" value={settings.smtp_pass} onChange={e => setSettings({...settings, smtp_pass: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <button type="submit" className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm">
          Save Email Settings
        </button>
      </form>
    </div>
  );
}

function FullRegistrationTab({ onSuccess }: { onSuccess: () => void }) {
  const adminFetch = useAdminFetch();
  const [formData, setFormData] = useState({ 
    name: '', father_name: '', class_name: '1', roll_no: '', 
    email: '', phone: '', dob: '', gender: 'Male', address: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/students/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        if (data.emailError) {
          alert(`Student registered successfully, but email failed: ${data.emailError}`);
        } else {
          onSuccess();
        }
        setFormData({ 
          name: '', father_name: '', class_name: '1', roll_no: '', 
          email: '', phone: '', dob: '', gender: 'Male', address: '' 
        });
      } else {
        alert(data.error || 'Failed to register student. Roll number might already exist for this class.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Full Student Registration</h3>
      <p className="text-sm text-slate-500 mb-6">Register a student with full details. An automatic confirmation email will be sent to the student's email address.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Student Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Father's Name *</label>
            <input required type="text" value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class *</label>
            <select required value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              {CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Roll Number *</label>
            <input required type="text" value={formData.roll_no} onChange={e => setFormData({...formData, roll_no: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Student Email Address *</label>
            <input required type="email" placeholder="student@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
            <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Full Address</label>
          <textarea rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>

        <button disabled={loading} type="submit" className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50">
          {loading ? 'Registering & Sending Email...' : 'Register Student & Send Email'}
        </button>
      </form>
    </div>
  );
}
