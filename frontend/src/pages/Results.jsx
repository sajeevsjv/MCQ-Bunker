import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, LayoutList } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/api/student/results/');
        setResults(res.data.results || res.data);
      } catch (error) {
        console.error('Failed to load results:', error);
        toast.error('Failed to load your results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading your results...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">My Results</h1>
        <p className="text-slate-500">View your past exam performance and history.</p>
      </div>
      
      {results.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4">
            <LayoutList className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No results yet!</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Complete an exam from the dashboard to see your performance metrics here.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, idx) => {
            const isPass = result.status?.toLowerCase() === 'pass';
            
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className={`h-2 w-full ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {result.subject_name || "Assessment"}
                    </span>
                    <span className={`flex items-center gap-1 text-sm font-bold ${isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isPass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {isPass ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">{result.chapter_name || "Chapter Exam"}</h3>
                  <div className="text-sm text-slate-500 flex items-center gap-1.5 mb-6">
                    <Clock size={14} />
                    {formatDate(result.attempted_at)}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Score</p>
                      <p className="text-lg font-bold text-slate-900">{result.score} / {result.total}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Percentage</p>
                      <p className={`text-xl font-bold ${isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                        {result.percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Results;
