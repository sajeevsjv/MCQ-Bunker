import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BookOpen, Clock, AlertCircle, X, HelpCircle, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ── Status config ─────────────────────────────────────────────── */
const STATUS = {
  approved:      { label: 'Available',       badgeClass: 'badge-available' },
  already_taken: { label: 'Completed',        badgeClass: 'badge-completed' },
  pending:       { label: 'Retake Pending',   badgeClass: 'badge-pending'   },
  rejected:      { label: 'Retake Rejected',  badgeClass: 'badge-rejected'  },
};

/* ── Skeleton card ─────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
      <div className="skeleton" style={{ height: 22, width: '38%' }} />
      <div className="skeleton" style={{ height: 22, width: '24%' }} />
    </div>
    <div className="skeleton" style={{ height: 28, width: '70%', marginBottom: 10 }} />
    <div className="skeleton" style={{ height: 16, width: '45%', marginBottom: 32 }} />
    <div className="skeleton" style={{ height: 46, width: '100%', borderRadius: 12 }} />
  </div>
);

/* ── Chapter card ──────────────────────────────────────────────── */
const ChapterCard = ({ chapter, index, onRetake, onStart }) => {
  const status = chapter.retake_status || 'approved';
  const { label, badgeClass } = STATUS[status] || STATUS.approved;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, ease: 'easeOut', duration: 0.35 }}
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span className="badge badge-brand">
          {chapter.subject_name || 'Subject'}
        </span>
        <span className={`badge ${badgeClass}`}>{label}</span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: '0 0 10px',
        lineHeight: 1.3,
        letterSpacing: '-0.02em',
      }}>
        {chapter.name || 'Chapter'}
      </h3>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span className="stat-chip">
          <Clock size={13} />
          {chapter.time_limit || 0} mins
        </span>
        <span className="stat-chip">
          <BookOpen size={13} />
          {chapter.total_questions || 0} Questions
        </span>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        {status === 'approved' && (
          <motion.button
            className="btn-primary"
            onClick={() => onStart(chapter.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap size={16} />
            Start Exam
          </motion.button>
        )}

        {status === 'already_taken' && (
          <motion.button
            className="btn-ghost"
            onClick={() => onRetake(chapter)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Request Retake
          </motion.button>
        )}

        {status === 'pending' && (
          <button disabled style={{
            width: '100%', padding: '11px 20px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12, color: '#f59e0b',
            fontWeight: 600, fontSize: '0.875rem',
            cursor: 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Loader2 size={15} style={{ animation: 'spin 1.2s linear infinite' }} />
            Pending Approval
          </button>
        )}

        {status === 'rejected' && (
          <button disabled style={{
            width: '100%', padding: '11px 20px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, color: '#ef4444',
            fontWeight: 600, fontSize: '0.875rem',
            cursor: 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <XCircle size={15} />
            Retake Rejected
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ── Retake Modal ──────────────────────────────────────────────── */
const RetakeModal = ({ chapter, onClose, onConfirm }) => (
  <AnimatePresence>
    {chapter && (
      <>
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 60,
          }}
        />

        {/* Dialog */}
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: 440,
            zIndex: 70,
            background: 'var(--bg-elevated)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-default)',
            borderRadius: 24,
            boxShadow: 'var(--shadow-lg)',
            padding: 32,
            overflow: 'hidden',
          }}
        >
          {/* Glow accent */}
          <div style={{
            position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 100,
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            filter: 'blur(20px)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <HelpCircle size={22} style={{ color: 'var(--brand-500)' }} />
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: 8, borderRadius: 10, border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-muted)', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex',
                }}
              >
                <X size={17} />
              </button>
            </div>

            <h2 style={{
              fontSize: '1.3rem', fontWeight: 800,
              color: 'var(--text-primary)', margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              Request Retake?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 20px', lineHeight: 1.6 }}>
              You're requesting a retake for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{chapter.name}</strong>.
            </p>

            {/* Warning box */}
            <div style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
              marginBottom: 28,
            }}>
              <AlertCircle size={17} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: '#d97706', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>
                After submitting, the admin must <strong>approve</strong> your request before this exam is unlocked again.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={onConfirm} style={{ flex: 1 }}>
                <CheckCircle size={16} />
                Submit Request
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ── Dashboard ─────────────────────────────────────────────────── */
const Dashboard = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retakeModal, setRetakeModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/student/chapters/');
        const data = res.data.results || res.data;
        setChapters(data.map(c => ({ ...c, retake_status: c.retake_status || 'approved' })));
      } catch (err) {
        console.error('Failed to load chapters:', err);
        toast.error('Could not load chapters.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRetakeConfirm = async () => {
    if (!retakeModal) return;
    try {
      await api.post('/api/student/retake-request/', { chapter: retakeModal.id });
      toast.success('Retake request sent!');
      setChapters(prev =>
        prev.map(c => c.id === retakeModal.id ? { ...c, retake_status: 'pending' } : c)
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send request.');
    } finally {
      setRetakeModal(null);
    }
  };

  return (
    <>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 32 }}
      >
        <h1 className="page-title">Available Exams</h1>
        <p className="page-subtitle">Select a chapter to begin your assessment or manage retakes.</p>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : chapters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ padding: 56, textAlign: 'center' }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <BookOpen size={28} style={{ color: 'var(--brand-500)' }} />
          </div>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem', margin: '0 0 8px' }}>
            No exams available yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Your assigned chapters will appear here once added by your admin.
          </p>
        </motion.div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {chapters.map((ch, i) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              index={i}
              onStart={id => navigate(`/exam/${id}`)}
              onRetake={ch => setRetakeModal(ch)}
            />
          ))}
        </div>
      )}

      {/* Retake modal */}
      <RetakeModal
        chapter={retakeModal}
        onClose={() => setRetakeModal(null)}
        onConfirm={handleRetakeConfirm}
      />
    </>
  );
};

export default Dashboard;
