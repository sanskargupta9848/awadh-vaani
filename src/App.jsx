import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './Dashboard';
import Lessons from './Lessons';
import Voice from './Voice';
import Repository from './Repository';
import Stories from './Stories';
import Profile from './Profile';
import Quiz from './Quiz';
import Community from './Community';
import Admin from './Admin';
import DataLab from './DataLab';
import Login, { getUsers, saveUsers, getSession, saveSession, clearSession } from './Login';

const DEFAULT_STATS = {
  xp: 0, streak: 0, dailyXP: 0, dailyXPGoal: 100,
  completedUnits: [], quizScores: [],
  activityLog: Array(28).fill(0),
  completedLessons: {}, // keys: "unitId_lessonIdx" → true
  voiceStats: {
    phraseHistory: {}, // { awadhi: { attempts, bestScore, lastScore, lastTried, unitTitle, tries: [{score, transcript, timestamp}] } }
  },
};

function App() {
  const [currentUser, setCurrentUser] = useState(null); // { username, name }
  const [activeScreen, setActiveScreen] = useState('Home');
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [stats, setStats] = useState(DEFAULT_STATS);

  // Restore session on mount
  useEffect(() => {
    const username = getSession();
    if (username) {
      const users = getUsers();
      if (users[username]) {
        setCurrentUser({ username, name: users[username].name });
        setStats(users[username].stats ?? DEFAULT_STATS);
      } else {
        clearSession();
      }
    }
  }, []);

  // Persist stats to localStorage whenever they change
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
    setStats(s => ({
      ...s,
      xp: s.xp + amount,
      dailyXP: Math.min(s.dailyXP + amount, s.dailyXPGoal),
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
      if (s.completedLessons?.[key]) return s; // already done — no double XP
      return {
        ...s,
        xp: s.xp + 20,
        dailyXP: Math.min(s.dailyXP + 20, s.dailyXPGoal),
        completedLessons: { ...s.completedLessons, [key]: true },
        activityLog: s.activityLog.map((v, i) => i === 27 ? Math.min(v + 1, 3) : v),
      };
    });
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

  const navigate = useCallback((screen) => setActiveScreen(screen), []);
  const handleQuizQuitRequest = () => setShowQuitModal(true);
  const confirmQuit = () => { setShowQuitModal(false); setActiveScreen('Home'); };
  const handleQuizFinish = useCallback((score, correct, total) => {
    recordQuiz(score, correct, total);
    setActiveScreen('Home');
  }, [recordQuiz]);

  // Show login screen if not authenticated
  if (!currentUser) return <Login onLogin={handleLogin} />;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':       return <Dashboard stats={stats} userName={currentUser.name} onNavigate={navigate} />;
      case 'Lessons':    return <Lessons onXP={addXP} completedLessons={stats.completedLessons ?? {}} onComplete={markLessonComplete} />;
      case 'Voice':      return <Voice onXP={addXP} voiceStats={stats.voiceStats ?? {}} onAttempt={recordVoiceAttempt} />;
      case 'Repository': return <Repository />;
      case 'Stories':    return <Stories onNavigate={navigate} />;
      case 'Profile':    return <Profile stats={stats} user={currentUser} onLogout={handleLogout} />;
      case 'Community':  return <Community />;
      case 'Admin':      return <Admin currentUsername={currentUser.username} />;
      case 'DataLab':    return <DataLab />;
      case 'Quiz':       return <Quiz onQuit={handleQuizQuitRequest} onFinish={handleQuizFinish} />;
      default:           return <Dashboard stats={stats} userName={currentUser.name} onNavigate={navigate} />;
    }
  };

  const NAV_ITEMS = [
    { name: 'Home', icon: '🏠' },
    { name: 'Lessons', icon: '📖' },
    { name: 'Quiz', icon: '📝' },
    { name: 'Voice', icon: '🎙️' },
    { name: 'Repository', icon: '🏛️' },
    { name: 'Stories', icon: '🐘' },
    { name: 'Community', icon: '🤝' },
    { name: 'Profile', icon: '👤' },
    { name: 'Admin', icon: '🔧' },
    { name: 'DataLab', icon: '🧪' },
  ];

  return (
    <div className="min-h-screen flex bg-ivory font-noto relative">

      {/* QUIT MODAL */}
      {showQuitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-forest/20 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden border-t-8 border-saffron border-x border-b border-marigold/10">
            <div className="p-8 text-center space-y-6">
              <div className="text-5xl">🛑</div>
              <div className="space-y-2">
                <h3 className="font-tiro text-2xl text-forest">सचमुच छोड़ब चाहत अहा?</h3>
                <p className="text-sm text-slate-500 font-medium italic">"Are you sure you want to quit? Your current progress will be lost."</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={confirmQuit} className="w-full bg-saffron text-white py-3 rounded-2xl font-bold shadow-lg shadow-saffron/20 hover:scale-105 transition active:scale-95">Yes, Quit Quiz</button>
                <button onClick={() => setShowQuitModal(false)} className="w-full border-2 border-forest text-forest py-3 rounded-2xl font-bold hover:bg-forest hover:text-white transition-all">No, Continue Learning</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <nav className={`w-64 bg-white border-r border-marigold/20 p-6 flex flex-col gap-6 shadow-2xl fixed h-full z-20 transition-all duration-500 ${activeScreen === 'Quiz' ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
        <div className="border-b border-marigold/10 pb-4">
          <h1 className="text-2xl font-black text-saffron tracking-tight font-tiro">AwadhVaani</h1>
          <p className="text-[10px] text-forest font-bold uppercase tracking-widest mt-1">Awadh ki Bhaakha</p>
        </div>

        <ul className="space-y-2 font-bold text-forest flex-1">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.name}
              onClick={() => navigate(item.name)}
              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                activeScreen === item.name
                  ? 'bg-saffron text-white shadow-lg scale-105'
                  : 'hover:bg-marigold/10 text-forest/70 hover:text-forest'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name}
            </li>
          ))}
        </ul>

        {/* User + XP bar + Logout */}
        <div className="pt-4 border-t border-marigold/10 space-y-3">
          {/* Logged-in user badge */}
          <div className="flex items-center gap-3 bg-ivory rounded-xl px-3 py-2 border border-marigold/10">
            <div className="w-8 h-8 bg-marigold rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-forest truncate">{currentUser.name}</p>
              <p className="text-[9px] text-slate-400 truncate">@{currentUser.username}</p>
            </div>
          </div>

          {/* Daily XP bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Daily XP</span>
              <span className="text-forest">{stats.dailyXP}/{stats.dailyXPGoal}</span>
            </div>
            <div className="h-1.5 bg-ivory rounded-full overflow-hidden border border-marigold/10">
              <div className="h-full bg-saffron rounded-full transition-all duration-700" style={{ width: `${(stats.dailyXP / stats.dailyXPGoal) * 100}%` }} />
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="w-full text-xs font-bold text-slate-400 hover:text-red-400 transition flex items-center justify-center gap-2 py-1"
          >
            <span>⎋</span> Sign Out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-10 min-w-[1040px]">
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;
