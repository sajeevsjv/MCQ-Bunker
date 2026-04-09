import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, LayoutList, Trophy, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ── Skeleton ──────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="card" style={{ padding: 24, overflow: 'hidden' }}>
    <div style={{ height: 4, background: 'var(--bg-muted)', marginBottom: 20 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
      <div className="skeleton" style={{ height: 20, width: '35%' }} />
      <div className="skeleton" style={{ height: 20, width: '20%' }} />
    </div>
    <div className="skeleton" style={{ height: 26, width: '68%', marginBottom: 8 }} />
    <div className="skeleton" style={{ height: 16, width: '44%', marginBottom: 28 }} />
    <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 16 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="skeleton" style={{ height: 36, width: '40%' }} />
      <div className="skeleton" style={{ height: 36, width: '30%' }} />
    </div>
  </div>
);

/* ── Result Card ───────────────────────────────────────────────── */
const ResultCard = ({ result, index }) => {
  const isPass = result.status?.toLowerCase() === 'pass';
  const pct = Number(result.percentage) || 0;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, ease: 'easeOut', duration: 0.35 }}
      style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored accent bar */}
      <div style={{
        height: 4,
        background: isPass
          ? 'linear-gradient(90deg, #10b981, #34d399)'
          : 'linear-gradient(90deg, #ef4444, #f87171)',
      }} />

      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <span className="badge badge-brand">
            {result.subject_name || 'Assessment'}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '0.78rem', fontWeight: 700,
            color: isPass ? '#10b981' : '#ef4444',
          }}>
            {isPass
              ? <CheckCircle2 size={14} />
              : <XCircle size={14} />}
            {isPass ? 'PASSED' : 'FAILED'}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 6px',
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
        }}>
          {result.chapter_name || 'Chapter Exam'}
        </h3>

        {/* Date */}
        <p style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.78rem', color: 'var(--text-muted)',
          margin: '0 0 18px',
        }}>
          <Clock size={12} />
          {formatDate(result.attempted_at)}
        </p>

        {/* Score row */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</p>
            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {result.score} <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>/ {result.total}</span>
            </p>
          </div>

          {/* Percentage ring visual */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Percentage
            </p>
            <p style={{
              fontSize: '1.5rem', fontWeight: 900, margin: 0,
              color: isPass ? '#10b981' : '#ef4444',
              letterSpacing: '-0.03em',
            }}>
              {pct}<span style={{ fontSize: '0.9rem' }}>%</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Results page ──────────────────────────────────────────────── */
const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/student/results/');
        setResults(res.data.results || res.data);
      } catch (err) {
        console.error('Failed to load results:', err);
        toast.error('Failed to load your results.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Summary stats */
  const totalPassed = results.filter(r => r.status?.toLowerCase() === 'pass').length;
  const avgPct = results.length
    ? Math.round(results.reduce((a, r) => a + (Number(r.percentage) || 0), 0) / results.length)
    : 0;

  return (
    <>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 32 }}
      >
        <h1 className="page-title">My Results</h1>
        <p className="page-subtitle">View your past exam performance and history.</p>
      </motion.div>

      {/* Summary chips — only show if results exist and not loading */}
      {!loading && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}
        >
          <div className="card" style={{
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderRadius: 14, flexShrink: 0,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trophy size={18} style={{ color: 'var(--brand-500)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 1px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Exams</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{results.length}</p>
            </div>
          </div>

          <div className="card" style={{
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderRadius: 14, flexShrink: 0,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 1px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Passed</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', margin: 0 }}>{totalPassed}</p>
            </div>
          </div>

          <div className="card" style={{
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderRadius: 14, flexShrink: 0,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={18} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 1px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Score</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>{avgPct}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cards grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : results.length === 0 ? (
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
            <LayoutList size={28} style={{ color: 'var(--brand-500)' }} />
          </div>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem', margin: '0 0 8px' }}>
            No results yet!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, maxWidth: 340, marginInline: 'auto' }}>
            Complete an exam from the Dashboard to see your performance metrics here.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {results.map((r, i) => (
            <ResultCard key={r.id} result={r} index={i} />
          ))}
        </div>
      )}
    </>
  );
};

export default Results;
