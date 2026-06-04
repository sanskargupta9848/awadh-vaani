import React, { useState, useCallback, useEffect } from 'react';
import Login, { getUsers, saveUsers, getSession, clearSession } from './Login';
import HomeM from './mobile/HomeM';
import LessonsM from './mobile/LessonsM';
import QuizM from './mobile/QuizM';
import VoiceM from './mobile/VoiceM';
import RepositoryM from './mobile/RepositoryM';
import ProfileM from './mobile/ProfileM';

const DEFAULT_STATS = {
  xp: 0, streak: 0, dailyXP: 0, dailyXPGoal: 100,
  completedUnits: [], quizScores: [],
  activityLog: Array(28).fill(0),
  completedLessons: {},
  voiceStats: { phraseHistory: {} },
};

const BOTTOM_TABS = [
  { id: 'Home', icon: '🏠', label: 'Home' },
  { id: 'Lessons', icon: '📖', label: 'Lessons' },
  { id: 'Quiz', icon: '📝', label: 'Quiz' },
  { id: 'Voice', icon: '🎙️', label: 'Voice' },
  { id: 'More', icon: '☰', label: 'More' },
];

const MORE_ITEMS = [
  { id: 'Repository', icon: '🏛️', label: 'Shabd Bhandar' },
  { id: 'Stories', icon: '🐘', label: 'Kahaaniyaan' },
  { id: 'Community', icon: '🤝', label: 'Samaaj' },
  { id: 'Profile', icon: '👤', label: 'Mera Pratiroop' },
];

export default function AppMobile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeScreen, setActiveScreen] = useState('Home');
  const [showMore, setShowMore] = useState(false);
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    const username = getSession();
    if (username) {
      const users = getUsers();
      if (users[username]) {
        setCurrentUser({ username, name: users[username].name });
        setStats(users[username].stats ?? DEFAULT_STATS);
      } else clearSession();
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const users = getUsers();
    if (users[currentUser.username]) {
      users[currentUser.username].stats = stats;
      saveUsers(users);
    }
  }, [stats, currentUser]);

  const handleLogin = useCallback((username, name, userStats) => {
    setCurrentUser({ username, name });
    setStats(userStats ?? DEFAULT_STATS);
    setActiveScreen('Home');
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setStats(DEFAULT_STATS);
    setActiveScreen('Home');
  }, []);

  const addXP = useCallback((amount) => {
    setStats(s => ({ ...s, xp: s.xp + amount, dailyXP: Math.min(s.dailyXP + amount, s.dailyXPGoal) }));
  }, []);

  const recordQuiz = useCallback((score, correct, total) => {
    setStats(s => ({
      ...s,
      xp: s.xp + score,
      dailyXP: Math.min(s.dailyXP + score, s.dailyXPGoal),
      quizScores: [...s.quizScores, { score, correct, total, date: Date.now() }],
      activityLog: s.activityLog.map((v, i) => i === 27 ? Math.min(v + 1, 3) : v),
    }));
  }, []);

  const recordVoiceAttempt = useCallback(({ awadhi, unitTitle, score, transcript, normalized }) => {
    setStats(s => {
      const history = s.voiceStats?.phraseHistory ?? {};
      const prev = history[awadhi] ?? { attempts: 0, bestScore: 0, tries: [] };
      const tries = [...(prev.tries ?? []), { score, transcript: normalized || transcript, raw: transcript, timestamp: Date.now() }].slice(-3);
      return {
        ...s,
        voiceStats: {
          ...s.voiceStats,
          phraseHistory: {
            ...history,
            [awadhi]: {
              attempts: (prev.attempts ?? 0) + 1,
              bestScore: Math.max(prev.bestScore ?? 0, score),
              lastScore: score,
              lastTried: Date.now(),
              unitTitle: unitTitle ?? prev.unitTitle,
              tries,
            },
          },
        },
      };
    });
  }, []);

  const markLessonComplete = useCallback((unitId, lessonIdx) => {
    const key = `${unitId}_${lessonIdx}`;
    setStats(s => {
      if (s.completedLessons?.[key]) return s;
      return {
        ...s, xp: s.xp + 20, dailyXP: Math.min(s.dailyXP + 20, s.dailyXPGoal),
        completedLessons: { ...s.completedLessons, [key]: true },
        activityLog: s.activityLog.map((v, i) => i === 27 ? Math.min(v + 1, 3) : v),
      };
    });
  }, []);

  const navigate = useCallback((screen) => {
    setShowMore(false);
    setActiveScreen(screen);
  }, []);

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':       return <HomeM stats={stats} user={currentUser} onNavigate={navigate} />;
      case 'Lessons':    return <LessonsM completedLessons={stats.completedLessons ?? {}} onComplete={markLessonComplete} onXP={addXP} />;
      case 'Quiz':       return <QuizM onFinish={(s,c,t) => { recordQuiz(s,c,t); navigate('Home'); }} onQuit={() => navigate('Home')} />;
      case 'Voice':      return <VoiceM onXP={addXP} voiceStats={stats.voiceStats ?? {}} onAttempt={recordVoiceAttempt} />;
      case 'Repository': return <RepositoryM />;
      case 'Profile':    return <ProfileM stats={stats} user={currentUser} onLogout={handleLogout} />;
      default:           return <HomeM stats={stats} user={currentUser} onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-ivory font-noto flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
        {renderScreen()}
      </div>

      {/* More sheet */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMore(false)} />
          <div className="relative bg-white rounded-t-3xl p-6 space-y-2 pb-28">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-3">More Features</p>
            {MORE_ITEMS.map(item => (
              <button key={item.id} onClick={() => navigate(item.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-ivory hover:bg-marigold/10 active:scale-98 transition text-left">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-bold text-forest">{item.label}</span>
                <span className="ml-auto text-slate-300">›</span>
              </button>
            ))}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 active:bg-red-100 transition text-left mt-2">
              <span className="text-2xl">⎋</span>
              <span className="font-bold text-red-500">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white border-t border-marigold/20 flex z-40 shadow-lg"
        style={{ width: '100%', maxWidth: 430 }}>
        {BOTTOM_TABS.map(tab => {
          const isActive = tab.id === 'More' ? showMore : activeScreen === tab.id && !showMore;
          return (
            <button key={tab.id}
              onClick={() => tab.id === 'More' ? setShowMore(s => !s) : navigate(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${isActive ? 'text-saffron' : 'text-slate-400'}`}>
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">{tab.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-saffron" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
