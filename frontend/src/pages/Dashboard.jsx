import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BookOpen, Clock, AlertCircle, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the Retake Confirmation Modal
  const [retakeModalChapter, setRetakeModalChapter] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await api.get('/api/student/chapters/');
        
        // Map the backend data
        const chaptersData = response.data.results || response.data;
        const formattedChapters = chaptersData.map(chapter => ({
          ...chapter,
          retake_status: chapter.retake_status || 'approved'
        }));
        
        setChapters(formattedChapters);
      } catch (error) {
        console.error('Failed to load chapters:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChapters();
  }, []);

  const handleConfirmRetakeRequest = async () => {
    if (!retakeModalChapter) return;
    
    try {
      await api.post('/api/student/retake-request/', { chapter: retakeModalChapter.id });
      toast.success('Retake request sent!');
      
      // Update local state so it shows as pending immediately
      setChapters(prev => prev.map(c => 
        c.id === retakeModalChapter.id ? { ...c, retake_status: 'pending' } : c
      ));
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send retake request');
    } finally {
      setRetakeModalChapter(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { text: 'Available', className: 'bg-emerald-100 text-emerald-800' };
      case 'already_taken': return { text: 'Completed', className: 'bg-slate-100 text-slate-800' };
      case 'pending': return { text: 'Retake Pending', className: 'bg-amber-100 text-amber-800' };
      case 'rejected': return { text: 'Retake Rejected', className: 'bg-red-100 text-red-800' };
      default: return { text: 'Available', className: 'bg-emerald-100 text-emerald-800' };
    }
  };

  if (loading) {
     return <div className="animate-pulse space-y-4 pt-4">
       <div className="h-10 bg-slate-200 rounded w-1/4"></div>
       <div className="h-6 bg-slate-200 rounded w-1/3 mb-8"></div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
         <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
         <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
       </div>
     </div>;
  }

  return (
    <>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Available Exams</h1>
          <p className="text-slate-500">Select a chapter to begin your assessment or manage retakes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {chapters.map((chapter, index) => {
            const badge = getStatusBadge(chapter.retake_status);
            
            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {chapter.subject_name || 'Subject'}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}>
                    {badge.text}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{chapter.name || 'Chapter'}</h3>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{chapter.time_limit || 0} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={16} />
                    <span>{chapter.total_questions || 0} Qs</span>
                  </div>
                </div>

                {chapter.retake_status === 'approved' && (
                  <button
                    onClick={() => navigate(`/exam/${chapter.id}`)}
                    className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold shadow-sm hover:bg-slate-800 focus:ring-4 focus:ring-slate-100 transition-all group-hover:bg-indigo-600 group-hover:focus:ring-indigo-100"
                  >
                    Start Exam
                  </button>
                )}

                {chapter.retake_status === 'already_taken' && (
                  <button
                    onClick={() => setRetakeModalChapter(chapter)}
                    className="w-full py-3 px-4 bg-slate-50 text-indigo-600 border border-slate-200 rounded-xl font-semibold hover:border-indigo-600 hover:bg-indigo-50 hover:shadow-sm focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    Request Retake
                  </button>
                )}

                {chapter.retake_status === 'pending' && (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-semibold cursor-wait"
                  >
                    Pending Approval
                  </button>
                )}

                {chapter.retake_status === 'rejected' && (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Retake Rejected
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Retake Confirmation Modal */}
      <AnimatePresence>
        {retakeModalChapter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              onClick={() => setRetakeModalChapter(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <HelpCircle size={24} />
                  </div>
                  <button 
                    onClick={() => setRetakeModalChapter(null)}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Request Retake?
                </h2>
                <div className="text-slate-600 space-y-4 text-sm leading-relaxed mb-8">
                  <p>
                    You are requesting to retake the exam for <span className="font-semibold text-slate-900">{retakeModalChapter.name}</span>.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-amber-800">
                      If you proceed, wait for the admin to approve your request. You may need to <span className="font-bold">contact the admin for approval</span> in order to unlock this exam again.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRetakeModalChapter(null)}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRetakeRequest}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
