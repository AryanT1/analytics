import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Real-time event tracking',
    desc: 'Buffer events in Redis and flush to Postgres every 30s — zero drop even under spikes.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Identity merging',
    desc: 'Link anonymous visitors to identified users seamlessly — across buffered and flushed events.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Rich analytics',
    desc: 'Events over time, top events, countries, devices, and top users — all in one dashboard.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: 'API key auth',
    desc: 'Send events with a simple HTTP call using your project API key. Rotate it any time.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Rate limiting & caching',
    desc: 'Per-IP rate limits on every route. Analytics responses cached in Redis for instant loads.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    title: 'Multi-project',
    desc: 'Manage as many products as you need. Each gets its own API key and isolated event stream.',
  },
];

const codeSnippet = `fetch('https://your-api/api/v1/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key',
  },
  body: JSON.stringify({
    eventName: 'button_clicked',
    userId: 'user_123',
    country: 'US',
    deviceType: 'desktop',
    properties: { button: 'signup_cta' },
  }),
});`;

export default function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Nav */}
      <nav className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight">Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-zinc-400 hover:text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/40 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Open-source product analytics
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          Know exactly what your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
            users are doing
          </span>
        </h1>

        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Track events, identify users, and explore rich analytics — all backed by a
          battle-tested Redis&nbsp;+&nbsp;Postgres pipeline.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/signup"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-violet-900/30"
          >
            Start for free
          </Link>
          <Link
            to="/login"
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Mock dashboard preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 z-10 pointer-events-none rounded-2xl" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left shadow-2xl shadow-black/60">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-zinc-500 text-xs">my-app — Analytics</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[['Total Events', '128,402'], ['Unique Users', '9,218'], ['Event Types', '14']].map(([label, val]) => (
                <div key={label} className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-semibold text-white mt-1.5">{val}</p>
                </div>
              ))}
            </div>
            <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-4">
              <p className="text-zinc-400 text-xs mb-4">Events over time</p>
              <div className="flex items-end gap-1.5 h-16">
                {[30, 45, 38, 60, 52, 80, 72, 95, 68, 88, 75, 100, 85, 92].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-violet-600/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Everything you need</h2>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Built with a production-grade architecture so you can focus on your product.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-950/60 border border-violet-800/30 text-violet-400 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <p className="text-white font-medium text-sm mb-1.5">{f.title}</p>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code snippet */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 rounded-full mb-6">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Simple SDK
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              One HTTP call.<br />That's it.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed mb-6">
              Send events from any language, any platform. No SDK required — just a POST
              with your API key and event data.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
            >
              Get your API key
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-zinc-500 text-xs">track-event.js</span>
            </div>
            <pre className="p-5 text-xs leading-relaxed text-zinc-300 overflow-x-auto">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-violet-950/60 to-zinc-900 border border-violet-800/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to start tracking?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Create a free account, set up a project, and send your first event in under 2 minutes.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-violet-900/40"
          >
            Create free account
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-zinc-500 text-sm">Analytics</span>
          </div>
          <p className="text-zinc-600 text-xs">Built with React · Express · Postgres · Redis</p>
        </div>
      </footer>
    </div>
  );
}
