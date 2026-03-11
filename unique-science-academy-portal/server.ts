import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, addDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Read Firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Initialize default settings if not exist
async function initSettings() {
  const settingsRef = doc(db, 'settings', 'global');
  const settingsSnap = await getDoc(settingsRef);
  
  if (!settingsSnap.exists()) {
    await setDoc(settingsRef, {
      logo_url: 'https://picsum.photos/seed/schoollogo/200/200',
      gallery_images: [
        'https://picsum.photos/seed/school1/800/400',
        'https://picsum.photos/seed/school2/800/400',
        'https://picsum.photos/seed/school3/800/400'
      ],
      contact_address: 'Brahampur, Jale\nDarbhanga, Bihar 847307',
      contact_email: 'info@uniquescienceacademy.in',
      contact_phone: '+91 98765 43210',
      admin_username: 'admin',
      admin_password: 'admin123',
      school_name: 'Unique Science Academy',
      hero_title: 'Welcome to Unique Science Academy',
      hero_subtitle: 'Empowering minds, shaping the future.',
      news_ticker: 'Admissions open for 2026-2027 | Annual Sports Meet on 15th March',
      about_title: 'Our Vision & Mission',
      about_text: 'We provide a nurturing environment that encourages students to excel academically, socially, and personally. Our dedicated faculty and modern facilities ensure a holistic development for every child.',
      about_image: 'https://picsum.photos/seed/welcome/800/600',
      principal_name: 'Dr. A. K. Sharma',
      principal_message: 'Education is the most powerful weapon which you can use to change the world. At Unique Science Academy, we strive to provide an environment that fosters intellectual and moral growth, preparing our students to be responsible global citizens.',
      principal_image: 'https://picsum.photos/seed/principal/400/400',
      smtp_host: 'smtp.gmail.com',
      smtp_port: '587',
      smtp_user: 'your-email@gmail.com',
      smtp_pass: '',
      testimonials: [
        {
          id: 1,
          name: 'Rahul Kumar',
          role: 'Parent',
          text: 'Unique Science Academy has transformed my child\'s future. The teachers are incredibly supportive and the environment is perfect for learning.',
          image: 'https://picsum.photos/seed/parent1/150/150'
        },
        {
          id: 2,
          name: 'Priya Sharma',
          role: 'Alumni',
          text: 'The foundation I received here helped me excel in my higher studies. I am forever grateful to the amazing faculty.',
          image: 'https://picsum.photos/seed/alumni1/150/150'
        }
      ]
    });
  }
}

initSettings();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // JWT Middleware
  const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        next();
      });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // API Routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      const settings = settingsSnap.data() || {};
      
      const publicKeys = [
        'logo_url', 'gallery_images', 'testimonials', 'contact_address', 
        'contact_email', 'contact_phone', 'school_name', 'hero_title', 
        'hero_subtitle', 'news_ticker', 'about_title', 'about_text', 
        'about_image', 'principal_name', 'principal_message', 'principal_image'
      ];
      
      const settingsMap = Object.keys(settings).reduce((acc: any, key) => {
        if (publicKeys.includes(key)) {
          acc[key] = settings[key];
        }
        return acc;
      }, {});
      
      res.json(settingsMap);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      res.json(settingsSnap.data() || {});
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Admin: Login & Credentials
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      const settings = settingsSnap.data() || {};
      
      if (username === settings.admin_username && password === settings.admin_password) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
      } else {
        res.status(401).json({ success: false, error: 'Invalid username or password' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/admin/credentials', authenticateAdmin, async (req, res) => {
    const { username, password } = req.body;
    try {
      const updates: any = {};
      if (username) updates.admin_username = username;
      if (password) updates.admin_password = password;
      
      if (Object.keys(updates).length > 0) {
        await setDoc(doc(db, 'settings', 'global'), updates, { merge: true });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update credentials' });
    }
  });

  app.post('/api/admin/settings', authenticateAdmin, async (req, res) => {
    const updates = req.body;
    try {
      await setDoc(doc(db, 'settings', 'global'), updates, { merge: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // Admin: Students
  app.get('/api/admin/students', authenticateAdmin, async (req, res) => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  app.post('/api/admin/students', authenticateAdmin, async (req, res) => {
    const { name, father_name, class_name, roll_no } = req.body;
    try {
      // Check if student exists
      const q = query(collection(db, 'students'), where('class_name', '==', class_name), where('roll_no', '==', roll_no));
      const existing = await getDocs(q);
      if (!existing.empty) {
        return res.status(400).json({ error: 'Student already exists with this Class and Roll No' });
      }
      
      const docRef = await addDoc(collection(db, 'students'), {
        name, father_name, class_name, roll_no,
        createdAt: new Date().toISOString()
      });
      res.json({ id: docRef.id, success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to add student' });
    }
  });

  app.post('/api/admin/students/full', authenticateAdmin, async (req, res) => {
    const { name, father_name, class_name, roll_no, email, phone, dob, gender, address } = req.body;
    try {
      // Check if student exists
      const q = query(collection(db, 'students'), where('class_name', '==', class_name), where('roll_no', '==', roll_no));
      const existing = await getDocs(q);
      if (!existing.empty) {
        return res.status(400).json({ error: 'Student already exists with this Class and Roll No' });
      }
      
      const docRef = await addDoc(collection(db, 'students'), {
        name, father_name, class_name, roll_no, email, phone, dob, gender, address,
        createdAt: new Date().toISOString()
      });
      
      let emailSent = false;
      let emailError = null;
      // Try to send email
      if (email) {
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        const settings = settingsSnap.data() || {};
        
        if (settings.smtp_user && settings.smtp_pass) {
          const transporter = nodemailer.createTransport({
            host: settings.smtp_host || 'smtp.gmail.com',
            port: parseInt(settings.smtp_port) || 587,
            secure: parseInt(settings.smtp_port) === 465,
            auth: {
              user: settings.smtp_user,
              pass: settings.smtp_pass,
            },
          });

          const mailOptions = {
            from: `"${settings.school_name || 'School Admin'}" <${settings.smtp_user}>`,
            to: email,
            subject: 'Registration Successful',
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">${settings.school_name || 'Our School'}</h1>
                  <p style="color: #6b7280; margin-top: 5px; font-size: 14px;">Registration Confirmation</p>
                </div>
                
                <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  <p style="font-size: 16px; color: #374151; margin-top: 0;">Dear <strong>${name}</strong>,</p>
                  <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Welcome! Your registration has been successfully completed. We are thrilled to have you join us. Below are your official registration details:</p>
                  
                  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;"><strong>Class:</strong></td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 500;">${class_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Roll Number:</strong></td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 500;">${roll_no}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Father's Name:</strong></td>
                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 500;">${father_name}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">You can now log in to the student portal using your <strong>Class</strong> and <strong>Roll Number</strong> to access your dashboard, test links, and results.</p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 15px; color: #374151; margin: 0;">Best Regards,</p>
                    <p style="font-size: 16px; color: #1e3a8a; font-weight: bold; margin: 5px 0 0 0;">School Administration</p>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 25px; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  <p style="margin: 0;"><strong>${settings.school_name || 'Our School'}</strong></p>
                  <p style="margin: 5px 0 0 0;">${settings.contact_address ? settings.contact_address.replace(/\\n/g, '<br/>') : 'School Address Not Provided'}</p>
                  ${settings.contact_phone ? '<p style="margin: 5px 0 0 0;">Phone: ' + settings.contact_phone + '</p>' : ''}
                  ${settings.contact_email ? '<p style="margin: 5px 0 0 0;">Email: ' + settings.contact_email + '</p>' : ''}
                </div>
              </div>
            `,
          };

          try {
            await transporter.sendMail(mailOptions);
            emailSent = true;
          } catch (err: any) {
            console.error("Email sending error:", err);
            emailError = err.message;
          }
        } else {
          emailError = "SMTP settings not configured";
        }
      }

      res.json({ id: docRef.id, success: true, emailSent, emailError });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to add student' });
    }
  });

  // Admin: Results
  app.post('/api/admin/results', authenticateAdmin, async (req, res) => {
    const { student_id, results } = req.body;
    try {
      // Delete existing results for this student
      const q = query(collection(db, 'results'), where('studentId', '==', student_id));
      const existing = await getDocs(q);
      const deletePromises = existing.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      
      // Add new results
      const addPromises = results.map((r: any) => addDoc(collection(db, 'results'), {
        studentId: student_id,
        subject: r.subject,
        marks: r.marks,
        total_marks: r.total_marks
      }));
      await Promise.all(addPromises);
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to add result' });
    }
  });

  // Admin: Test Links
  app.get('/api/admin/test-links', authenticateAdmin, async (req, res) => {
    try {
      const linksSnap = await getDocs(collection(db, 'test_links'));
      const links = linksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch test links' });
    }
  });

  app.post('/api/admin/test-links', authenticateAdmin, async (req, res) => {
    const { class_name, subject, title, link } = req.body;
    try {
      await addDoc(collection(db, 'test_links'), {
        class_name, subject, title, link,
        createdAt: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to add test link' });
    }
  });

  app.delete('/api/admin/test-links/:id', authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, 'test_links', req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete test link' });
    }
  });

  app.post('/api/admin/online-test-marks', authenticateAdmin, async (req, res) => {
    const { class_name, roll_no, test_title, score, total } = req.body;
    try {
      const q = query(collection(db, 'students'), where('class_name', '==', class_name), where('roll_no', '==', roll_no));
      const studentSnap = await getDocs(q);
      
      if (studentSnap.empty) {
        return res.status(404).json({ error: 'Student not found with this Class and Roll No' });
      }
      
      const studentId = studentSnap.docs[0].id;
      
      await addDoc(collection(db, 'online_test_marks'), {
        studentId, test_title, score, total,
        date: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to add marks' });
    }
  });

  app.post('/api/webhook/test-result', async (req, res) => {
    const { class_name, roll_no, test_title, score, total } = req.body;
    try {
      const q = query(collection(db, 'students'), where('class_name', '==', class_name), where('roll_no', '==', roll_no));
      const studentSnap = await getDocs(q);
      
      if (studentSnap.empty) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      const studentId = studentSnap.docs[0].id;
      
      await addDoc(collection(db, 'online_test_marks'), {
        studentId, test_title, score, total,
        date: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to add marks via webhook' });
    }
  });

  // Student: Login
  app.post('/api/student/login', async (req, res) => {
    const { class_name, roll_no } = req.body;
    try {
      const q = query(collection(db, 'students'), where('class_name', '==', class_name), where('roll_no', '==', roll_no));
      const studentSnap = await getDocs(q);
      
      if (!studentSnap.empty) {
        const student = { id: studentSnap.docs[0].id, ...studentSnap.docs[0].data() };
        res.json({ success: true, student });
      } else {
        res.status(401).json({ success: false, error: 'Invalid Class or Roll Number' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Student: Results
  app.get('/api/student/:id/results', async (req, res) => {
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      const settings = settingsSnap.data() || {};
      
      if (!settings.results_published) {
        return res.json({ published: false, results: [] });
      }

      const q = query(collection(db, 'results'), where('studentId', '==', req.params.id));
      const resultsSnap = await getDocs(q);
      const results = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ published: true, results });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  });

  // Student: Test Links
  app.get('/api/student/test-links/:class_name', async (req, res) => {
    try {
      const q = query(collection(db, 'test_links'), where('class_name', '==', req.params.class_name));
      const linksSnap = await getDocs(q);
      const links = linksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch test links' });
    }
  });

  app.get('/api/student/:id/online-test-marks', async (req, res) => {
    try {
      const q = query(collection(db, 'online_test_marks'), where('studentId', '==', req.params.id));
      const marksSnap = await getDocs(q);
      const marks = marksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(marks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch online test marks' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();