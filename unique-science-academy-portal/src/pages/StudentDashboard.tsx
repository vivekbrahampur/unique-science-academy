import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, Edit3, LogOut, Download, CheckCircle, AlertCircle, FileQuestion } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('results');

  useEffect(() => {
    const authData = localStorage.getItem('studentAuth');
    if (!authData) {
      navigate('/student/login');
    } else {
      setStudent(JSON.parse(authData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentAuth');
    navigate('/student/login');
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row print:bg-white print:block">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-blue-900 text-white shadow-xl print:hidden">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-xl font-bold uppercase tracking-wider">Student Portal</h2>
          <p className="text-sm text-blue-200 mt-2">{student.name}</p>
          <p className="text-xs text-blue-300">Class: {student.class_name} | Roll: {student.roll_no}</p>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'results' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <FileText className="h-5 w-5" />
            <span>My Results</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'test' ? 'bg-blue-800 text-yellow-400' : 'hover:bg-blue-800'}`}
          >
            <Edit3 className="h-5 w-5" />
            <span>Online Test</span>
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto print:p-0 print:overflow-visible">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'results' && <ResultsTab student={student} />}
          {activeTab === 'test' && <TestTab student={student} />}
        </motion.div>
      </main>
    </div>
  );
}

function getGradeAndRemark(marks: number, total: number) {
  if (total === 0) return { grade: '-', remark: '-' };
  const percentage = (marks / total) * 100;
  if (percentage >= 91) return { grade: 'A1', remark: 'Excellent' };
  if (percentage >= 81) return { grade: 'A2', remark: 'Very Good' };
  if (percentage >= 71) return { grade: 'B1', remark: 'Good' };
  if (percentage >= 61) return { grade: 'B2', remark: 'Above Average' };
  if (percentage >= 51) return { grade: 'C1', remark: 'Average' };
  if (percentage >= 41) return { grade: 'C2', remark: 'Fair' };
  if (percentage >= 33) return { grade: 'D', remark: 'Pass' };
  return { grade: 'E', remark: 'Needs Improvement' };
}

function ResultsTab({ student }: { student: any }) {
  const [results, setResults] = useState<any[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(console.error);

    fetch(`/api/student/${student.id}/results`)
      .then(res => res.json())
      .then(data => {
        if (data.published) {
          setIsPublished(true);
          setResults(data.results || []);
        } else {
          setIsPublished(false);
          setResults([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [student.id]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-10">Loading results...</div>;

  if (!isPublished) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center py-16">
        <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Results Not Published Yet</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          The final exam results for your class have not been published by the administration yet. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none">
      <div className="flex justify-between items-center mb-6 border-b pb-4 print:hidden">
        <h3 className="text-2xl font-bold text-slate-800">Digital Marksheet</h3>
        <button onClick={handleDownload} className="flex items-center space-x-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors">
          <Download className="h-4 w-4" />
          <span>Download / Print</span>
        </button>
      </div>

      {/* Marksheet Content */}
      <div className="border-4 border-double border-blue-900 p-8 rounded-xl bg-slate-50 print:bg-white">
        <div className="flex flex-col md:flex-row items-center justify-center mb-8 border-b-4 border-slate-800 pb-6 gap-6">
          {logoUrl && <img src={logoUrl} alt="School Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 uppercase tracking-widest drop-shadow-sm">Unique Science Academy</h1>
            <p className="text-lg text-slate-700 uppercase tracking-widest mt-2 font-semibold">Brahampur, Jale, Darbhanga</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-4 uppercase bg-slate-200 inline-block px-6 py-2 rounded-full border-2 border-slate-300">Statement of Marks</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 text-sm font-medium text-slate-700">
          <div><span className="text-slate-500">Student Name:</span> {student.name}</div>
          <div><span className="text-slate-500">Father's Name:</span> {student.father_name}</div>
          <div><span className="text-slate-500">Class:</span> {student.class_name}</div>
          <div><span className="text-slate-500">Roll No:</span> {student.roll_no}</div>
        </div>

        {results.length > 0 ? (
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="border border-slate-300 px-4 py-3 font-bold uppercase text-sm">Subject</th>
                <th className="border border-slate-300 px-4 py-3 font-bold uppercase text-sm w-32 text-center">Marks Obtained</th>
                <th className="border border-slate-300 px-4 py-3 font-bold uppercase text-sm w-32 text-center">Total Marks</th>
                <th className="border border-slate-300 px-4 py-3 font-bold uppercase text-sm w-24 text-center">Grade</th>
                <th className="border border-slate-300 px-4 py-3 font-bold uppercase text-sm w-32 text-center">Remark</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => {
                const { grade, remark } = getGradeAndRemark(r.marks, r.total_marks);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="border border-slate-300 px-4 py-3 font-medium text-slate-800">{r.subject}</td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">{r.marks}</td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-700">{r.total_marks}</td>
                    <td className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-800">{grade}</td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-600 text-sm">{remark}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-bold text-slate-900">
                <td className="border border-slate-300 px-4 py-3 text-right uppercase">Grand Total</td>
                <td className="border border-slate-300 px-4 py-3 text-center">{results.reduce((acc, curr) => acc + curr.marks, 0)}</td>
                <td className="border border-slate-300 px-4 py-3 text-center">{results.reduce((acc, curr) => acc + curr.total_marks, 0)}</td>
                <td className="border border-slate-300 px-4 py-3 text-center">
                  {getGradeAndRemark(results.reduce((acc, curr) => acc + curr.marks, 0), results.reduce((acc, curr) => acc + curr.total_marks, 0)).grade}
                </td>
                <td className="border border-slate-300 px-4 py-3 text-center text-sm">
                  {getGradeAndRemark(results.reduce((acc, curr) => acc + curr.marks, 0), results.reduce((acc, curr) => acc + curr.total_marks, 0)).remark}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
            <p>No results have been uploaded yet.</p>
          </div>
        )}

        <div className="mt-16 flex justify-between text-sm font-bold text-slate-800 uppercase">
          <div className="border-t-2 border-slate-400 pt-2 w-48 text-center">Date</div>
          <div className="border-t-2 border-slate-400 pt-2 w-48 text-center">Principal Signature</div>
        </div>
      </div>
    </div>
  );
}

function TestTab({ student }: { student: any }) {
  const [testLinks, setTestLinks] = useState<any[]>([]);
  const [testMarks, setTestMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/student/test-links/${encodeURIComponent(student.class_name)}`).then(res => res.json()),
      fetch(`/api/student/${student.id}/online-test-marks`).then(res => res.json())
    ])
    .then(([linksData, marksData]) => {
      setTestLinks(linksData);
      setTestMarks(marksData);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [student.class_name, student.id]);

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading tests...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Available Online Tests</h3>
        {testLinks.length === 0 ? (
          <div className="text-center py-12">
            <FileQuestion className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">There are currently no online tests assigned for {student.class_name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testLinks.map((test) => (
              <div key={test.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                      {test.subject}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(test.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{test.title}</h4>
                  <p className="text-sm text-slate-600 mb-6">Click the button below to start your test. Make sure you are logged into your Google account if required.</p>
                </div>
                <a 
                  href={test.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full inline-flex justify-center items-center bg-blue-800 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm"
                >
                  Take Test
                  <Edit3 className="ml-2 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {testMarks.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">My Test Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test Title</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {testMarks.map((mark) => {
                  const percentage = ((Number(mark.score) / Number(mark.total)) * 100).toFixed(1);
                  return (
                    <tr key={mark.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(mark.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {mark.test_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">
                        {mark.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500">
                        {mark.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(percentage) >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
