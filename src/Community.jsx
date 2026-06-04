import React, { useState } from 'react';

const INITIAL_POSTS = {
  'All Posts': [
    { id: 1, name: 'Sushila Devi', region: 'Sitapur', time: '2h ago', content: 'आज के मौसम बहुत नीक है, एकदम सुहावन! (Today\'s weather is very good, absolutely pleasant!)', wahs: 12, comments: 4, verified: true, tab: 'All Posts' },
    { id: 2, name: 'Ramesh Yadav', region: 'Lucknow', time: '5h ago', content: 'हमरे गाँव मा एक पुरान पेड बाटय जेहका उमर सौ साल से जादा बाटय। (In our village there is an old tree more than a hundred years old.)', wahs: 8, comments: 2, verified: false, tab: 'All Posts' },
    { id: 3, name: 'Jagannath Prasad', region: 'Lakhimpur Kheri', time: '1d ago', content: 'अवधी सीखब आसान बाटय अगर रोज अभ्यास करय। (Learning Awadhi is easy if you practice daily.)', wahs: 31, comments: 9, verified: true, tab: 'All Posts' },
  ],
  'Questions': [
    { id: 4, name: 'Priya Tiwari', region: 'Faizabad', time: '3h ago', content: '"बाटय" अउर "अहय" मा का फरक बाटय? (What is the difference between "baatay" and "ahay"?)', wahs: 5, comments: 7, verified: false, tab: 'Questions' },
    { id: 5, name: 'Mohd. Aslam', region: 'Unnao', time: '8h ago', content: 'अवधी मा "धन्यवाद" कइसे कहा जात है? (How do you say "thank you" in Awadhi?)', wahs: 3, comments: 11, verified: false, tab: 'Questions' },
  ],
  'Word Debates': [
    { id: 6, name: 'Sumitra K.', region: 'Rae Bareli', time: '1h ago', content: '"महतारी" का शुद्ध अवधी रूप है या "अम्मा"? (Is "Mahtari" the pure Awadhi form or is it "Amma"?)', wahs: 44, comments: 22, verified: true, tab: 'Word Debates' },
    { id: 7, name: 'Deepa Misra', region: 'Barabanki', time: '6h ago', content: '"बिआह" (biaah) और "ब्याह" (byaah) दोनों एक ही शब्द हैं? (Are "Biaah" and "Byaah" the same word?)', wahs: 19, comments: 8, verified: false, tab: 'Word Debates' },
  ],
  'Stories': [
    { id: 8, name: 'Jagannath Prasad', region: 'Lakhimpur Kheri', time: '2d ago', content: 'हमरे बाप कहा थें — "जब तक घर मा रोटी बाटय, मेहमान कय स्वागत होत है।" (My father used to say — as long as there is bread in the house, guests are welcome.)', wahs: 67, comments: 15, verified: true, tab: 'Stories' },
    { id: 9, name: 'Sushila Devi', region: 'Sitapur', time: '3d ago', content: 'गाँव कय पुरान बुजुर्ग कहा करा थें — "पानी अउर बोली दोनों बहत रहा चाही।" (The old elders of the village used to say — both water and language should keep flowing.)', wahs: 89, comments: 23, verified: true, tab: 'Stories' },
  ],
};

const NAV_ITEMS = [
  { label: 'Discussion', icon: '💬' },
  { label: 'Exchange', icon: '🤝' },
  { label: 'Challenges', icon: '🏆' },
  { label: 'Native Corner', icon: '🏡' },
  { label: 'Announce', icon: '📢' },
];

const TABS = ['All Posts', 'Questions', 'Word Debates', 'Stories'];

export default function Community() {
  const [activeTab, setActiveTab] = useState('All Posts');
  const [activeNav, setActiveNav] = useState('Discussion');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [draft, setDraft] = useState('');
  const [postCount, setPostCount] = useState(20);

  const visiblePosts = posts[activeTab] || [];

  const handleWah = (tab, id) => {
    setPosts(prev => ({
      ...prev,
      [tab]: prev[tab].map(p => p.id === id ? { ...p, wahs: p.wahs + 1 } : p),
    }));
  };

  const handlePost = () => {
    if (!draft.trim()) return;
    const newPost = {
      id: Date.now(),
      name: 'Rohan Yadav',
      region: 'Lakhimpur Kheri',
      time: 'Just now',
      content: draft.trim(),
      wahs: 0,
      comments: 0,
      verified: false,
      tab: activeTab,
    };
    setPosts(prev => ({
      ...prev,
      [activeTab]: [newPost, ...prev[activeTab]],
      'All Posts': [newPost, ...prev['All Posts']],
    }));
    setDraft('');
    setPostCount(c => c + 1);
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn font-noto">

      {/* HEADER BANNER */}
      <header className="relative w-full h-48 rounded-[2.5rem] bg-saffron overflow-hidden mb-8 shadow-lg border-b-4 border-marigold">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c2.5 0 5 2 5 5s-2 5-5 5-5-2-5-5 2.5-5 5-5z' fill='%23FDF6EC' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-10 text-center">
          <h2 className="text-5xl font-tiro mb-2 drop-shadow-md">हमारी बिरादरी — Our Community</h2>
          <p className="text-lg opacity-90 mb-6 font-medium">Connect with learners, native speakers, and language preservers</p>
          <div className="flex gap-4">
            <button
              onClick={() => { setActiveTab('All Posts'); document.getElementById('composer')?.focus(); }}
              className="bg-white text-saffron px-8 py-2.5 rounded-full font-bold shadow-md hover:scale-105 transition"
            >
              Start a Discussion
            </button>
            <button
              onClick={() => setActiveTab('Exchange')}
              className="border-2 border-white text-white bg-white/10 backdrop-blur-sm px-8 py-2.5 rounded-full font-bold hover:bg-white hover:text-saffron transition"
            >
              Find a Language Partner
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-6 items-start">

        {/* LEFT NAV */}
        <aside className="w-[200px] space-y-6 flex-shrink-0">
          <nav className="bg-white p-4 rounded-3xl border border-marigold/10 shadow-sm">
            <ul className="space-y-1">
              {NAV_ITEMS.map(item => (
                <li
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition ${activeNav === item.label ? 'bg-saffron text-white shadow-md' : 'hover:bg-ivory text-forest'}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                </li>
              ))}
            </ul>
          </nav>

          <div className="bg-white p-5 rounded-3xl border border-marigold/10 shadow-sm text-center">
            <p className="text-[10px] font-black text-forest uppercase tracking-widest mb-3">Your Stats</p>
            <div className="space-y-3">
              <StatRow label="Posts" val={String(postCount)} />
              <StatRow label="Words" val="4" />
              <StatRow label="Rank" val="Baatuni" color="text-saffron" />
            </div>
            <div className="mt-4 pt-4 border-t border-ivory">
              <span className="text-2xl">🗣️</span>
            </div>
          </div>
        </aside>

        {/* CENTER FEED */}
        <div className="flex-1 max-w-[600px] space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-marigold/10 gap-8 px-2 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'text-saffron border-b-2 border-saffron' : 'text-slate-400 hover:text-forest'}`}
              >
                {tab}
                <span className="ml-2 text-[10px] bg-ivory px-1.5 py-0.5 rounded-full text-slate-400">
                  {(posts[tab] || []).length}
                </span>
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="bg-white p-5 rounded-[2rem] border border-marigold/10 shadow-sm flex gap-4 items-start">
            <div className="w-12 h-12 bg-marigold rounded-full flex-shrink-0 border-2 border-ivory shadow-sm flex items-center justify-center text-white font-bold text-lg">R</div>
            <div className="flex-1 space-y-4">
              <textarea
                id="composer"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Share something in Awadhi today…"
                className="w-full bg-ivory/50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-marigold/30 transition min-h-[80px] resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-3 text-lg">
                  <button title="Audio Clip" className="grayscale hover:grayscale-0 transition">🎙️</button>
                  <button title="Image" className="grayscale hover:grayscale-0 transition">🖼️</button>
                  <button title="Awadhi Word" className="grayscale hover:grayscale-0 transition">📝</button>
                </div>
                <button
                  onClick={handlePost}
                  disabled={!draft.trim()}
                  className={`px-6 py-2 rounded-xl font-bold text-sm shadow-md transition ${draft.trim() ? 'bg-saffron text-white hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Pinned word */}
          <div className="bg-ivory border-2 border-marigold/20 rounded-[2.5rem] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-saffron text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl">PINNED</div>
            <h4 className="text-xs font-black text-marigold uppercase tracking-widest mb-4">Word of the Community</h4>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-tiro text-forest mb-1">ठेस</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thes</p>
              </div>
              <div className="flex-1 border-l border-marigold/20 pl-6">
                <p className="text-sm font-medium text-slate-700">A rare word meaning "emotional hurt" or "a physical stumble" — submitted by a native speaker.</p>
                <button className="mt-2 text-forest text-xs font-bold hover:underline">VOTE TO REPOSITORY +</button>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-6">
            {visiblePosts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-4xl mb-3">🌾</p>
                <p className="font-bold">No posts yet in this tab.</p>
                <p className="text-sm mt-1">Be the first to share something!</p>
              </div>
            ) : (
              visiblePosts.map(post => (
                <PostCard key={post.id} post={post} onWah={() => handleWah(activeTab, post.id)} />
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-[240px] space-y-6 flex-shrink-0">
          <div className="bg-white p-5 rounded-3xl border border-marigold/10 shadow-sm">
            <h4 className="text-[10px] font-black text-forest uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Now
            </h4>
            <div className="flex -space-x-2 mb-3">
              {['R', 'S', 'J', 'M'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-marigold/20 border-2 border-white flex items-center justify-center text-[10px] font-bold text-marigold">{l}</div>
              ))}
              <div className="w-8 h-8 rounded-full bg-marigold flex items-center justify-center text-[10px] font-bold text-white">+12</div>
            </div>
            <p className="text-[10px] text-slate-400">16 learners active right now</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-marigold/10 shadow-sm">
            <h4 className="text-[10px] font-black text-forest uppercase tracking-widest mb-4">Weekly Challenge</h4>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 leading-relaxed">Use the word <span className="text-saffron">'ठेस'</span> in a sentence.</p>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>142 Entries</span>
                <span className="text-saffron font-black">22h left</span>
              </div>
              <button
                onClick={() => { setDraft("ठेस — "); document.getElementById('composer')?.focus(); }}
                className="w-full bg-saffron text-white py-2 rounded-xl text-xs font-bold shadow-sm hover:scale-105 transition"
              >
                Submit Entry
              </button>
            </div>
          </div>

          <div className="bg-forest p-5 rounded-3xl text-white shadow-lg">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Top Preservers</h4>
            <div className="space-y-4">
              <ContributorItem name="Jagannath Prasad" count="89" rank={1} />
              <ContributorItem name="Sushila Devi" count="67" rank={2} />
              <ContributorItem name="Rohan Y." count="42" rank={3} />
            </div>
          </div>
        </aside>
      </div>

      {/* NATIVE SPEAKER CORNER */}
      <section className="mt-12 bg-white rounded-[3rem] p-10 border border-marigold/10 shadow-inner">
        <div className="flex justify-between items-end mb-8 border-b border-ivory pb-4">
          <div>
            <h3 className="font-tiro text-3xl text-forest">Native Speaker Corner</h3>
            <p className="text-slate-400 text-sm italic">Learn directly from the source</p>
          </div>
          <button className="text-saffron font-bold text-sm hover:underline">Become a Verified Speaker →</button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <VerifiedSpeakerCard name="Jagannath Prasad" region="Lakhimpur Kheri" variant="Central Awadhi" />
          <VerifiedSpeakerCard name="Sumitra K." region="Rae Bareli" variant="Baiswari" />
          <VerifiedSpeakerCard name="Mohd. Aslam" region="Lucknow" variant="Urban Awadhi" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10">
        <div className="flex justify-between items-center py-4 border-t border-marigold/10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex gap-6">
            <button className="hover:text-forest transition">Community Guidelines</button>
            <button className="text-red-400 hover:text-red-600 transition">Report Content</button>
          </div>
          <div className="flex gap-2 bg-ivory p-1 rounded-full border border-marigold/10">
            <button className="px-3 py-1 bg-white text-saffron rounded-full shadow-sm">Devanagari</button>
            <button className="px-3 py-1 text-slate-400 hover:text-forest transition">Roman</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PostCard({ post, onWah }) {
  const [liked, setLiked] = useState(false);
  const handleWah = () => { if (!liked) { onWah(); setLiked(true); } };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-marigold/10 shadow-sm space-y-4 hover:border-marigold/40 transition">
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-marigold/20 rounded-full border border-marigold/20 flex items-center justify-center font-bold text-marigold">
            {post.name[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {post.name}
              {post.verified && <span className="text-[10px] text-forest ml-2 bg-forest/5 px-2 py-0.5 rounded">✓ Verified Speaker</span>}
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-bold">{post.region} · {post.time}</p>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-500">•••</button>
      </div>
      <p className="text-slate-700 leading-relaxed font-tiro text-lg">{post.content}</p>
      <div className="flex items-center gap-6 pt-2 border-t border-ivory">
        <button
          onClick={handleWah}
          className={`flex items-center gap-2 text-xs font-bold transition ${liked ? 'text-saffron' : 'text-slate-400 hover:text-saffron'}`}
        >
          <span>👏</span> Wah! {post.wahs > 0 && <span className="ml-1">{post.wahs}</span>}
        </button>
        <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-forest transition">
          <span>💬</span> {post.comments} Comments
        </button>
        <button className="ml-auto text-slate-300 hover:text-marigold text-lg transition">🔗</button>
      </div>
    </div>
  );
}

const StatRow = ({ label, val, color }) => (
  <div className="flex justify-between text-xs font-bold">
    <span className="text-slate-400">{label}</span>
    <span className={color || 'text-forest'}>{val}</span>
  </div>
);

const ContributorItem = ({ name, count, rank }) => (
  <div className="flex items-center gap-3">
    <span className="text-lg">{rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}</span>
    <div className="flex-1">
      <p className="text-xs font-bold leading-none">{name}</p>
      <p className="text-[9px] opacity-70 mt-1 uppercase tracking-tighter">{count} Contributions</p>
    </div>
  </div>
);

const VerifiedSpeakerCard = ({ name, region, variant }) => (
  <div className="bg-ivory/30 p-6 rounded-[2rem] border-2 border-dashed border-marigold/20 hover:border-marigold/50 transition">
    <div className="flex gap-4 mb-4">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-marigold/10 flex items-center justify-center text-xl">👤</div>
      <div>
        <p className="font-bold text-forest">{name}</p>
        <p className="text-[10px] font-black text-marigold uppercase tracking-widest">{region}</p>
      </div>
    </div>
    <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">Expert in {variant}. Available for mentoring sessions on weekends.</p>
    <div className="grid grid-cols-2 gap-2">
      <button className="bg-forest text-white py-2 rounded-xl text-[10px] font-bold shadow-sm hover:bg-forest/80 transition">Request Tutoring</button>
      <button className="bg-white text-forest border border-forest/20 py-2 rounded-xl text-[10px] font-bold shadow-sm hover:bg-forest hover:text-white transition">Contributions</button>
    </div>
  </div>
);
