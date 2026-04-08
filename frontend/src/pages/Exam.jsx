import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

// Mock data (replace with API calls in real implementation)
const MOCK_QUESTIONS = [
  {
    id: 101,
    question_text: "Which of the following is not a property of a transaction (ACID)?",
    choices: [
      { id: 1, option_text: "Atomicity" },
      { id: 2, option_text: "Consistency" },
      { id: 3, option_text: "Isolation" },
      { id: 4, option_text: "Duplication" },
    ]
  },
  {
    id: 102,
    question_text: "What does SQL stand for?",
    choices: [
      { id: 5, option_text: "Structured Query Language" },
      { id: 6, option_text: "Strong Question Language" },
      { id: 7, option_text: "Structured Question Language" },
      { id: 8, option_text: "Standard Query Language" },
    ]
  }
];

const Exam = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: choiceId }
  const [timeLeft, setTimeLeft] = useState(30 * 60); // fallback
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get(`/api/student/chapters/${chapterId}/questions/`);
        
        // Ensure we parse from the new backend structure
        const data = response.data;
        const fetchedQuestions = data.questions || [];
        
        setChapterName(data.chapter || "Exam");
        
        if (data.time_limit_minutes) {
          const storedFinishTime = localStorage.getItem(`exam_finish_time_${chapterId}`);
          if (storedFinishTime && parseInt(storedFinishTime, 10) > Date.now()) {
             // Continue from previous time
             setTimeLeft(Math.floor((parseInt(storedFinishTime, 10) - Date.now()) / 1000));
          } else {
             // Start fresh
             const newTimeLeft = data.time_limit_minutes * 60;
             setTimeLeft(newTimeLeft);
             localStorage.setItem(`exam_finish_time_${chapterId}`, Date.now() + newTimeLeft * 1000);
          }
        }

        if (fetchedQuestions.length === 0) {
           toast.error("No questions found for this chapter.");
        }
        setQuestions(fetchedQuestions);
      } catch (error) {
        toast.error('Failed to load questions.');
        console.error('Fetch questions error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [chapterId]);

  useEffect(() => {
    if (loading) return;
    
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    const timerInt = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerInt);
  }, [timeLeft, loading]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectChoice = async (choiceId) => {
    const currQId = questions[currentQuestionIdx].id;
    
    // Optimistic UI Update first
    setAnswers(prev => ({
      ...prev,
      [currQId]: choiceId
    }));
    
    // Background sync to server
    try {
      await api.post('/api/student/submit-answer/', {
        question_id: currQId,
        selected_choice_id: choiceId
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
      toast.error('Could not sync answer to server.');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/student/submit-exam/', { chapter_id: chapterId });
      localStorage.removeItem(`exam_finish_time_${chapterId}`);
      toast.success('Exam submitted successfully!');
      navigate('/results');
    } catch (error) {
      console.error('Final submit error:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit exam.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
         <p className="text-slate-500 font-medium tracking-wide">Loading Exam...</p>
       </div>
     );
  }

  if (!questions || questions.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
         <p className="text-slate-500 font-medium tracking-wide">No questions found for this exam.</p>
         <button onClick={() => navigate('/')} className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
           Return to Dashboard
         </button>
       </div>
     );
  }

  const currentQ = questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === questions.length - 1;
  const progressPercent = ((currentQuestionIdx + 1) / questions.length) * 100;
  
  // Warning color when less than 5 minutes
  const isTimeLow = timeLeft < 300;

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-12">
      {/* Header & Timer Section */}
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{chapterName} Assessment</h2>
          <p className="text-slate-500">Question {currentQuestionIdx + 1} of {questions.length}</p>
        </div>
        
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl font-mono text-xl font-bold transition-colors ${isTimeLow ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-800'}`}>
          <Clock size={24} className={isTimeLow ? 'animate-pulse' : ''} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <motion.div 
            className="bg-indigo-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden min-h-[400px] flex flex-col relative">
        <div className="p-8 md:p-12 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-2xl font-semibold text-slate-900 mb-8 leading-relaxed">
                {currentQ.question_text}
              </h3>
              
              <div className="space-y-4">
                {currentQ.choices.map((choice) => {
                  const isSelected = answers[currentQ.id] === choice.id;
                  
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice.id)}
                      className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                        isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                         {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-lg ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                        {choice.option_text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 md:px-12 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIdx === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {isLastQuestion ? (
             <button
             onClick={handleFinalSubmit}
             disabled={submitting}
             className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-wait"
           >
             {submitting ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
             ) : (
               <CheckCircle2 size={20} />
             )}
             Submit Exam
           </button>
          ) : (
            <button
            onClick={nextQuestion}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
          >
            Next
            <ChevronRight size={20} />
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exam;
