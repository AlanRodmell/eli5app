import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const Arrow = ({ direction = 'right' }) => <span aria-hidden="true">{direction === 'right' ? '→' : '←'}</span>;

const Spark = ({ small = false }) => (
  <svg className={small ? 'spark spark--small' : 'spark'} viewBox="0 0 48 48" aria-hidden="true">
    <path d="M24 2c1.6 14 8 20.4 22 22-14 1.6-20.4 8-22 22-1.6-14-8-20.4-22-22C16 22.4 22.4 16 24 2Z" fill="currentColor" />
  </svg>
);

const TOPICS = {
  'black holes': {
    title: 'Black holes', kicker: 'Space, gravity & one very hungry trampoline',
    gist: 'A black hole is a place where matter has been squeezed so tightly that its gravity becomes strong enough to trap even light.',
    analogy: 'Imagine a trampoline. Put a bowling ball in the middle and the fabric dips. Roll a marble nearby and it curves toward the ball. A black hole is like an unimaginably heavy bowling ball making a dip so steep that anything getting too close cannot roll back out.',
    steps: ['A massive star runs out of fuel.', 'Without outward pressure, gravity wins and the star collapses.', 'Its matter packs into an incredibly small space.', 'Past the event horizon, every possible path points inward.'],
    why: 'They help us test how gravity, space and time behave at their most extreme.',
    check: { q: 'What makes a black hole “black”?', options: ['It is painted dark', 'Light cannot escape it', 'It only exists at night'], correct: 1 },
    color: '#8f8cff'
  },
  'compound interest': {
    title: 'Compound interest', kicker: 'Money making tiny copies of itself',
    gist: 'Compound interest means earning interest on your original money and on the interest you have already earned.',
    analogy: 'Think of a snowball rolling downhill. It starts small, picks up snow, then that bigger ball picks up even more snow on the next turn. Time is the hill; your money is the snowball.',
    steps: ['You start with £100.', 'At 10%, it earns £10 in year one.', 'Year two starts with £110, not £100.', 'Now 10% earns £11 — and the effect keeps growing.'],
    why: 'It makes time one of the most powerful ingredients in saving — and one of the most expensive parts of borrowing.',
    check: { q: 'After one year, £100 earns £10. What amount earns interest next?', options: ['£10', '£100', '£110'], correct: 2 },
    color: '#ff9d76'
  },
  'apis': {
    title: 'APIs', kicker: 'How apps ask other apps for things',
    gist: 'An API is a set of rules that lets one piece of software request information or actions from another.',
    analogy: 'An API is like a waiter. You choose from a menu, the waiter carries your request to the kitchen, and brings back the result. You do not need to know how the kitchen works — only how to order.',
    steps: ['Your app sends a request in an agreed format.', 'The API checks what you asked for and whether you are allowed.', 'The other system does the work.', 'The API returns a tidy response your app can use.'],
    why: 'APIs let teams build on useful services — maps, payments, weather — without recreating them from scratch.',
    check: { q: 'In the restaurant analogy, what is the API?', options: ['The kitchen', 'The waiter', 'The food'], correct: 1 },
    color: '#5fc5a7'
  },
  'inflation': {
    title: 'Inflation', kicker: 'Why the same £10 buys less over time',
    gist: 'Inflation is a broad rise in prices, which means each pound can buy a little less than before.',
    analogy: 'Imagine a pizza cut into ten slices, with ten people each holding one token. If everyone suddenly gets two tokens but the pizza stays the same size, people can offer more tokens for each slice. The pizza has not grown; the tokens are simply worth less.',
    steps: ['People and businesses want goods and services.', 'Supply cannot always keep up with demand or costs rise.', 'Sellers increase prices.', 'If this happens widely, the average cost of living rises.'],
    why: 'A little inflation is normal, but fast inflation can make planning, saving and everyday life much harder.',
    check: { q: 'If prices rise but your pay stays the same, you can usually buy…', options: ['More', 'The same', 'Less'], correct: 2 },
    color: '#ffd447'
  }
};

const QUESTIONS = [
  {
    eyebrow: 'Start here', title: 'When something is brand new, what helps first?', note: 'No wrong answers. Pick what feels most natural.', key: 'entry',
    options: [
      { id: 'analogy', icon: '🍊', title: 'A familiar comparison', copy: '“It’s a bit like…” gives me a hook.' },
      { id: 'map', icon: '⌘', title: 'The big picture', copy: 'Show me how all the pieces connect.' },
      { id: 'visual', icon: '◉', title: 'Something I can see', copy: 'A diagram or demonstration makes it real.' },
      { id: 'practice', icon: '↗', title: 'Let me try it', copy: 'I learn fastest by doing and adjusting.' }
    ]
  },
  {
    eyebrow: 'Your pace', title: 'How much detail feels right at first?', note: 'You can always change this for an individual explanation.', key: 'pace',
    options: [
      { id: 'quick', icon: '⚡', title: 'Give me the gist', copy: 'One clear idea, then let me decide.' },
      { id: 'steady', icon: '☰', title: 'Walk me through it', copy: 'A few small steps with breathing room.' },
      { id: 'deep', icon: '＋', title: 'I like the full story', copy: 'Context helps me trust the answer.' }
    ]
  },
  {
    eyebrow: 'Make it stick', title: 'Which would you remember tomorrow?', note: 'Choose the format you naturally come back to.', key: 'memory',
    options: [
      { id: 'story', icon: '❝', title: 'A tiny story', copy: 'People, situations and a memorable moment.' },
      { id: 'diagram', icon: '△', title: 'A visual map', copy: 'Shapes, arrows and only the key labels.' },
      { id: 'quiz', icon: '?', title: 'A quick check', copy: 'A question that proves I really got it.' }
    ]
  }
];

const PROFILES = {
  analogy: ['The Connection Maker', 'You learn by linking new ideas to things you already know.'],
  map: ['The Big-Picture Thinker', 'You understand the whole when you can see how its parts connect.'],
  visual: ['The Visual Explorer', 'Ideas click when they become something you can picture.'],
  practice: ['The Hands-On Solver', 'You understand best when you can test an idea for yourself.']
};

function App() {
  const saved = localStorage.getItem('eli5-profile');
  const [screen, setScreen] = useState(saved ? 'home' : 'welcome');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(saved ? JSON.parse(saved) : {});
  const [topic, setTopic] = useState('');
  const [activeTopic, setActiveTopic] = useState(null);
  const [tab, setTab] = useState('analogy');
  const [level, setLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [explainError, setExplainError] = useState('');

  const finishOnboarding = (nextAnswers) => {
    localStorage.setItem('eli5-profile', JSON.stringify(nextAnswers));
    setAnswers(nextAnswers);
    setScreen('profile');
  };

  const choose = (key, id) => {
    const next = { ...answers, [key]: id };
    setAnswers(next);
    if (step === QUESTIONS.length - 1) finishOnboarding(next);
    else setTimeout(() => setStep((s) => s + 1), 180);
  };

  const explain = async (value = topic, requestedLevel) => {
    const clean = value.trim();
    if (!clean) return;
    const nextLevel = requestedLevel ?? (answers.pace === 'deep' ? 1 : answers.pace === 'quick' ? -1 : 0);
    setTopic(clean);
    setActiveTopic(null);
    setExplainError('');
    setLoading(true);
    if (requestedLevel === undefined) {
      setTab(answers.memory === 'quiz' ? 'check' : answers.entry === 'map' || answers.memory === 'diagram' ? 'steps' : 'analogy');
    }
    setLevel(nextLevel);
    setScreen('explain');
    try {
      const endpoint = import.meta.env.VITE_API_URL || '/api/explain';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: clean, profile: answers, detail: ['tiny', 'clear', 'deeper'][nextLevel + 1] })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.gist || !payload.check) throw new Error(payload.error || 'The live explanation service is not connected.');
      setActiveTopic({ ...payload, color: topicColor(clean), source: 'ai' });
    } catch (error) {
      const authoredDemo = TOPICS[clean.toLowerCase()];
      if (authoredDemo) {
        setActiveTopic({ ...authoredDemo, source: 'demo' });
      } else {
        setExplainError(error.message || 'We could not create that explanation.');
      }
    } finally {
      setLoading(false);
    }
  };

  const changeLevel = (nextLevel) => {
    if (nextLevel === level || loading) return;
    explain(topic, nextLevel);
  };

  const restart = () => {
    localStorage.removeItem('eli5-profile');
    setAnswers({}); setStep(0); setScreen('welcome'); setActiveTopic(null);
  };

  return (
    <main className={`app app--${screen}`}>
      <Header screen={screen} setScreen={setScreen} restart={restart} />
      {screen === 'welcome' && <Welcome onStart={() => setScreen('onboarding')} onSkip={() => { const quick = { entry: 'analogy', pace: 'steady', memory: 'quiz' }; finishOnboarding(quick); }} />}
      {screen === 'onboarding' && <Onboarding step={step} answers={answers} onChoose={choose} onBack={() => step ? setStep(step - 1) : setScreen('welcome')} />}
      {screen === 'profile' && <Profile answers={answers} onContinue={() => setScreen('home')} />}
      {screen === 'home' && <Home answers={answers} topic={topic} setTopic={setTopic} onExplain={explain} restart={restart} />}
      {screen === 'explain' && <Explanation data={activeTopic} answers={answers} topic={topic} tab={tab} setTab={setTab} level={level} onLevelChange={changeLevel} loading={loading} error={explainError} onRetry={() => explain(topic, level)} onBack={() => setScreen('home')} />}
    </main>
  );
}

function Header({ screen, setScreen, restart }) {
  return <header className="site-header">
    <button className="brand" onClick={() => screen !== 'welcome' && setScreen('home')} aria-label="eli5 home"><span>eli</span><b>5</b><i>.</i></button>
    <div className="header-right">
      {['home', 'explain'].includes(screen) && <><button className="profile-pill" onClick={restart}><span>AR</span><span className="profile-pill__text">My learning profile</span></button></>}
      {!['home', 'explain'].includes(screen) && <span className="header-note">Made for curious minds <Spark small /></span>}
    </div>
  </header>;
}

function Welcome({ onStart, onSkip }) {
  return <section className="welcome page-shell">
    <div className="welcome__copy">
      <div className="eyebrow"><span>✦</span> Explanations made for your brain</div>
      <h1>Finally,<br />it <em>clicks.</em></h1>
      <p>Tell us how you learn. We’ll turn tricky ideas into explanations that actually make sense to <i>you</i>.</p>
      <div className="actions"><button className="button button--dark" onClick={onStart}>Find my learning style <Arrow /></button><button className="text-button" onClick={onSkip}>I’ll explore first</button></div>
      <div className="trust"><span className="avatars"><i>🧑🏽</i><i>👩🏻</i><i>👨🏾</i></span><span><b>Built for every kind of learner</b><small>About 2 minutes to personalise</small></span></div>
    </div>
    <div className="hero-art" aria-hidden="true">
      <div className="orbit orbit--one"></div><div className="orbit orbit--two"></div>
      <div className="idea-card idea-card--main"><span className="idea-icon">💡</span><p>Compound interest</p><b>Money making tiny copies of itself</b><span className="mini-line"></span><span className="mini-line short"></span></div>
      <div className="idea-card idea-card--top"><span>“Ohhh—<br />now I get it.”</span><Spark small /></div>
      <div className="idea-card idea-card--bottom"><span className="play">▶</span><span><b>60 sec</b><small>visual story</small></span></div>
      <div className="doodle doodle--arrow">↝</div><div className="doodle doodle--star">✦</div>
    </div>
  </section>;
}

function Onboarding({ step, answers, onChoose, onBack }) {
  const q = QUESTIONS[step];
  return <section className="onboarding page-shell">
    <div className="progress-wrap"><span>{String(step + 1).padStart(2, '0')}</span><div className="progress"><i style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div><span>{String(QUESTIONS.length).padStart(2, '0')}</span></div>
    <div className="question-head"><div className="eyebrow"><span>✦</span> {q.eyebrow}</div><h2>{q.title}</h2><p>{q.note}</p></div>
    <div className={`option-grid option-grid--${q.options.length}`}>
      {q.options.map((option) => <button key={option.id} className={`option-card ${answers[q.key] === option.id ? 'selected' : ''}`} onClick={() => onChoose(q.key, option.id)}>
        <span className="option-icon">{option.icon}</span><span><b>{option.title}</b><small>{option.copy}</small></span><i className="radio">✓</i>
      </button>)}
    </div>
    <button className="back-button" onClick={onBack}><Arrow direction="left" /> Back</button>
  </section>;
}

function Profile({ answers, onContinue }) {
  const [name, description] = PROFILES[answers.entry] || PROFILES.analogy;
  return <section className="profile-result page-shell">
    <div className="profile-visual"><div className="profile-sun"><Spark /><span>{answers.entry === 'visual' ? '◉' : answers.entry === 'practice' ? '↗' : answers.entry === 'map' ? '⌘' : '∞'}</span></div><i className="profile-dot one" /><i className="profile-dot two" /></div>
    <div className="eyebrow"><span>✦</span> Your learning profile</div><p className="little">You’re</p><h2>{name}</h2><p className="profile-description">{description}</p>
    <div className="profile-tags"><span>Starts with <b>{answers.entry === 'analogy' ? 'analogies' : answers.entry}</b></span><span>Prefers a <b>{answers.pace} pace</b></span><span>Remembers with <b>{answers.memory}</b></span></div>
    <button className="button button--dark" onClick={onContinue}>Show me my home <Arrow /></button>
  </section>;
}

function Home({ answers, topic, setTopic, onExplain, restart }) {
  const [profileName] = PROFILES[answers.entry] || PROFILES.analogy;
  return <section className="home page-shell">
    <div className="home-intro"><div className="eyebrow"><span>✦</span> Your curious corner</div><h1>What should we<br /><em>make sense of?</em></h1><p>Ask about anything. We’ll shape the answer for <b>{profileName.toLowerCase()}</b> in you.</p></div>
    <form className="ask-box" onSubmit={(e) => { e.preventDefault(); onExplain(); }}>
      <label htmlFor="topic">I want to understand…</label><div className="ask-input"><input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Try “black holes” or type anything" autoFocus /><button className="button button--yellow" type="submit" aria-label="Explain"><Arrow /></button></div>
      <div className="suggestions"><span>Popular now</span>{['Black holes', 'Compound interest', 'APIs', 'Inflation'].map(x => <button type="button" key={x} onClick={() => onExplain(x)}>{x}</button>)}</div>
    </form>
    <div className="home-grid">
      <article className="daily-card"><span className="card-label">Today’s tiny wonder</span><div className="daily-art">🌳<span>↕</span></div><h3>Trees talk to each other.</h3><p>Through underground fungal networks — a bit like nature’s internet.</p><button onClick={() => onExplain('APIs')}>Explain the connection <Arrow /></button></article>
      <article className="profile-card"><div><span className="card-label">How I’m tailoring things</span><h3>{profileName}</h3><p>{PROFILES[answers.entry]?.[1]}</p></div><button onClick={restart}>Retake profile</button></article>
      <article className="recent-card"><span className="card-label">Ready when you are</span><h3>Your next “ohhh” moment starts with one question.</h3><div className="scribble">ask<br />away ↗</div></article>
    </div>
  </section>;
}

function Explanation({ data, topic, tab, setTab, level, onLevelChange, loading, error, onRetry, onBack }) {
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState('');
  useEffect(() => { setPicked(null); setFeedback(''); }, [data]);
  if (!data) return <GenerationState topic={topic} level={level} loading={loading} error={error} onRetry={onRetry} onBack={onBack} />;
  const detail = data.gist;
  const tryAnotherWay = () => {
    const modes = ['analogy', 'steps', 'why', 'check'];
    setTab(modes[(modes.indexOf(tab) + 1) % modes.length]);
    setFeedback('another');
  };
  return <section className="explanation page-shell" style={{ '--topic': data.color }}>
    <button className="back-button explanation-back" onClick={onBack}><Arrow direction="left" /> Ask something else</button>
    <div className="explain-head"><div><div className="eyebrow"><span>✦</span> {data.source === 'demo' ? 'Authored demo — live AI not connected' : 'Generated for your learning style'}</div><h1>{data.title}</h1><p>{data.kicker}</p></div><div className="level-control"><span>Detail</span><button className={level === -1 ? 'active' : ''} onClick={() => onLevelChange(-1)}>Tiny</button><button className={level === 0 ? 'active' : ''} onClick={() => onLevelChange(0)}>Clear</button><button className={level === 1 ? 'active' : ''} onClick={() => onLevelChange(1)}>Deeper</button></div></div>
    <article className="gist-card"><span className="gist-label">The one-line version</span><h2>{level === -1 ? data.gist.split('.')[0] + '.' : detail}</h2><span className="sound-mark">)))</span></article>
    <nav className="explain-tabs" aria-label="Explanation format">
      {[['analogy', '◎', 'Analogy'], ['steps', '↳', 'Step by step'], ['why', '✦', 'Why it matters'], ['check', '?', 'Check I got it']].map(([id, icon, label]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? 'active' : ''}><span>{icon}</span>{label}</button>)}
    </nav>
    <div className="explain-content">
      {tab === 'analogy' && <div className="analogy-layout"><div><span className="content-label">Picture it like this</span><h3>{data.analogy}</h3><p className="tailored-note"><Spark small /> We started with a comparison because that’s how you like to meet new ideas.</p></div><ConceptArt title={data.title} /></div>}
      {tab === 'steps' && <div><span className="content-label">Four small steps</span><ol className="steps-list">{data.steps.map((s, i) => <li key={s}><span>{i + 1}</span><p>{s}</p></li>)}</ol></div>}
      {tab === 'why' && <div className="why-panel"><span className="content-label">The “so what?”</span><h3>{data.why}</h3><div className="quote-mark">“</div></div>}
      {tab === 'check' && <div className="quiz-panel"><span className="content-label">One quick check</span><h3>{data.check.q}</h3><div className="quiz-options">{data.check.options.map((x, i) => <button className={picked === null ? '' : i === data.check.correct ? 'correct' : picked === i ? 'wrong' : ''} key={x} onClick={() => setPicked(i)}><span>{String.fromCharCode(65 + i)}</span>{x}</button>)}</div>{picked !== null && <p className="quiz-result">{picked === data.check.correct ? `Yes — that’s it. ${data.check.explanation || 'It clicked! ✦'}` : `Not quite. ${data.check.explanation || 'Try the answer that matches the core idea above.'}`}</p>}</div>}
    </div>
    <div className="explain-footer"><span>{feedback === 'yes' ? 'Lovely — it clicked ✦' : feedback === 'almost' ? 'That helps us tune the next one' : feedback === 'another' ? 'Here’s another angle' : 'Was this clear?'}</span><button className={feedback === 'yes' ? 'selected' : ''} onClick={() => setFeedback('yes')}>Yes, it clicked</button><button className={feedback === 'almost' ? 'selected' : ''} onClick={() => setFeedback('almost')}>Almost</button><button onClick={tryAnotherWay}>Try another way</button></div>
  </section>;
}

function GenerationState({ topic, level, loading, error, onRetry, onBack }) {
  return <section className="generation-state page-shell">
    <button className="back-button explanation-back" onClick={onBack}><Arrow direction="left" /> Ask something else</button>
    <div className="generation-card">
      {loading ? <>
        <div className="thinking-orbit"><span /><i /><b>✦</b></div>
        <div className="eyebrow"><span>✦</span> Building this around how you learn</div>
        <h1>Making sense of<br /><em>{topic}</em></h1>
        <p>Finding the core idea, a useful comparison, four clear steps and one quick way to check it clicked.</p>
        <div className="generation-progress"><i /></div>
        <small>{level === -1 ? 'Keeping it tiny' : level === 1 ? 'Adding one useful layer of depth' : 'Clear, with just enough detail'}</small>
      </> : <>
        <div className="service-icon">↯</div>
        <div className="eyebrow"><span>✦</span> The idea is ready — the connection isn’t</div>
        <h1>Live explanations<br /><em>need a backend.</em></h1>
        <p>{error || 'The explanation service has not been connected yet.'}</p>
        <button className="button button--dark" onClick={onRetry}>Try the connection again <Arrow /></button>
        <small className="service-note">Your learning profile is saved. Once the secure API is connected, this screen will generate the full explanation.</small>
      </>}
    </div>
  </section>;
}

function ConceptArt({ title }) {
  return <div className="concept-art" aria-hidden="true"><div className="concept-ring ring-one" /><div className="concept-ring ring-two" /><div className="concept-core">{title === 'APIs' ? '↔' : title === 'Inflation' ? '£' : title === 'Compound interest' ? '%' : '●'}</div><span className="concept-label label-one">what you know</span><span className="concept-label label-two">new idea</span><span className="concept-arrow">↝</span></div>;
}

function makeFallback(value) {
  return {
    title: value.charAt(0).toUpperCase() + value.slice(1), kicker: 'A first foothold into a bigger idea', color: '#8f8cff',
    gist: `${value} becomes easier to understand when we split it into what it is, how it works, and why people use it.`,
    analogy: `Think of ${value} like a new board game. The name feels unfamiliar at first, but once you know the goal, the pieces and the few rules that connect them, the whole thing becomes much less mysterious.`,
    steps: [`Start with the problem ${value} is connected to.`, 'Name the few important pieces.', 'See how those pieces affect one another.', 'Test the idea with a small, real example.'],
    why: `Understanding ${value} gives you a useful mental model — a way to recognise it, ask better questions and connect it to ideas you already know.`,
    check: { q: `What is the best first move when learning about ${value}?`, options: ['Memorise every detail', 'Find the core idea', 'Avoid examples'], correct: 1 }
  };
}

function topicColor(value) {
  const colors = ['#8f8cff', '#ff9d76', '#5fc5a7', '#ffd447', '#73b8ef'];
  const hash = [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
