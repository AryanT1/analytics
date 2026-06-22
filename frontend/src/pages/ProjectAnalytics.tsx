import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  getSummary, getEventsByName, getEventsOverTime, getUsersOverTime,
  getEventsByCountry, getEventsByDevice, getTopUsers,
} from '../api/analytics';
import { getProject, rotateApiKey } from '../api/project';
import type { Summary, EventByName, TimePoint, CountryPoint, DevicePoint, TopUser, Project } from '../types';

const CHART_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

type Tab = 'overview' | 'integration';

const fetchAll = (id: string, from: string) => Promise.all([
  getProject(id),
  getSummary(id),
  getEventsByName(id, 10),
  getEventsOverTime(id, from),
  getUsersOverTime(id, from),
  getEventsByCountry(id, 8),
  getEventsByDevice(id),
  getTopUsers(id, 10),
]);

function CopyBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-zinc-800">
      <div className="flex items-center justify-between bg-zinc-800/60 px-4 py-2.5">
        <span className="text-zinc-400 text-xs font-medium">{label}</span>
        <button
          onClick={copy}
          className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
            copied ? 'text-emerald-400 bg-emerald-900/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-zinc-900 px-4 py-4 text-xs text-zinc-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Field({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex gap-3 py-3 border-b border-zinc-800/60 last:border-0">
      <div className="w-36 shrink-0">
        <code className="text-violet-300 text-xs">{name}</code>
        {required && <span className="ml-1.5 text-red-400 text-[10px]">*</span>}
      </div>
      <div className="w-20 shrink-0 text-blue-400 text-xs font-mono">{type}</div>
      <div className="text-zinc-500 text-xs leading-relaxed">{desc}</div>
    </div>
  );
}

function IntegrationTab({ apiKey }: { apiKey: string }) {
  const base = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

  const trackSnippet = `fetch('${base}/api/v1/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}',
  },
  body: JSON.stringify({
    eventName: 'button_clicked',   // required
    userId: 'user_abc123',         // optional
    anonymousId: 'anon_xyz789',    // optional
    country: 'US',                 // optional
    deviceType: 'desktop',         // optional
    properties: {                  // optional — any JSON
      page: '/pricing',
      plan: 'pro',
    },
  }),
});`;

  const curlSnippet = `curl -X POST ${base}/api/v1/track \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "eventName": "page_view",
    "userId": "user_abc123",
    "country": "US",
    "deviceType": "mobile"
  }'`;

  const identifySnippet = `fetch('${base}/api/v1/track/identify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}',
  },
  body: JSON.stringify({
    anonymousId: 'anon_xyz789',  // required — the visitor's anonymous ID
    userId: 'user_abc123',       // required — the real user ID after login
  }),
});`;

  const pythonSnippet = `import requests

requests.post(
    '${base}/api/v1/track',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey}',
    },
    json={
        'eventName': 'purchase_completed',
        'userId': 'user_abc123',
        'country': 'IN',
        'deviceType': 'desktop',
        'properties': {'amount': 49, 'currency': 'USD'},
    },
)`;

  return (
    <div className="space-y-8 py-2">

      {/* API Key callout */}
      <div className="bg-violet-950/30 border border-violet-800/40 rounded-2xl p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-900/50 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-violet-200 text-sm font-medium mb-1">Your API key</p>
          <p className="text-violet-400/70 text-xs mb-3">Include this in every request as the <code className="bg-violet-900/40 px-1.5 py-0.5 rounded text-violet-300">x-api-key</code> header.</p>
          <code className="block bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono break-all">{apiKey}</code>
        </div>
      </div>

      {/* Track event */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg">POST</span>
          <code className="text-zinc-300 text-sm">/api/v1/track</code>
          <span className="text-zinc-600 text-xs">Rate limit: 100 req/min</span>
        </div>
        <p className="text-zinc-400 text-sm mb-4">Send a single event. Events are buffered in Redis and flushed to the database every 30 seconds.</p>

        <div className="space-y-3 mb-5">
          <CopyBlock label="JavaScript / fetch" code={trackSnippet} />
          <CopyBlock label="cURL" code={curlSnippet} />
          <CopyBlock label="Python / requests" code={pythonSnippet} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Request body fields</p>
          <Field name="eventName" type="string" required desc="Name of the event, e.g. page_view, button_clicked, purchase_completed" />
          <Field name="userId" type="string" desc="Your app's stable user ID. Optional — omit for anonymous visitors." />
          <Field name="anonymousId" type="string" desc="A client-generated ID for anonymous visitors (e.g. a UUID stored in localStorage)." />
          <Field name="country" type="string" desc='ISO 3166-1 alpha-2 country code, e.g. "US", "IN", "DE".' />
          <Field name="deviceType" type="string" desc='Device category, e.g. "desktop", "mobile", "tablet".' />
          <Field name="properties" type="object" desc="Any additional JSON data you want to attach to the event." />
        </div>

        <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Response</p>
          <CopyBlock label="200 OK" code={`{ "success": true, "message": "Event received" }`} />
        </div>
      </div>

      <div className="border-t border-zinc-800" />

      {/* Identify */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg">POST</span>
          <code className="text-zinc-300 text-sm">/api/v1/track/identify</code>
          <span className="text-zinc-600 text-xs">Rate limit: 20 req/min</span>
        </div>
        <p className="text-zinc-400 text-sm mb-4">
          Link an anonymous visitor to an identified user — call this after login or signup.
          This retroactively updates both already-flushed Postgres events and events still buffered in Redis.
        </p>

        <div className="space-y-3 mb-5">
          <CopyBlock label="JavaScript / fetch" code={identifySnippet} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Request body fields</p>
          <Field name="anonymousId" type="string" required desc="The anonymous ID that was used before the user logged in." />
          <Field name="userId" type="string" required desc="The real user ID to associate all past and future events with." />
        </div>

        <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Response</p>
          <CopyBlock label="200 OK" code={`{ "success": true, "message": "Identity merged" }`} />
        </div>
      </div>

      <div className="border-t border-zinc-800" />

      {/* Errors */}
      <div>
        <p className="text-white font-semibold text-sm mb-4">Error responses</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {[
            ['401', 'Missing or invalid x-api-key header'],
            ['400', 'Validation error — check required fields'],
            ['429', 'Rate limit exceeded — slow down requests'],
            ['500', 'Internal server error'],
          ].map(([code, msg]) => (
            <div key={code} className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800/60 last:border-0">
              <code className={`text-xs font-bold px-2 py-0.5 rounded ${
                code === '401' || code === '403' ? 'bg-red-900/30 text-red-400' :
                code === '400' ? 'bg-amber-900/30 text-amber-400' :
                code === '429' ? 'bg-orange-900/30 text-orange-400' :
                'bg-zinc-800 text-zinc-400'
              }`}>{code}</code>
              <span className="text-zinc-400 text-xs">{msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick tip */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex gap-3">
        <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-1">Tip: anonymous → identified flow</p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Generate a UUID on first visit and store it in localStorage as <code className="text-zinc-400">anonymousId</code>.
            Send it with every <code className="text-zinc-400">track</code> call. After login, call <code className="text-zinc-400">identify</code> once with both IDs — all past events will be merged automatically.
          </p>
        </div>
      </div>

    </div>
  );
}

const tooltipStyle = {
  backgroundColor: '#09090b',
  border: '1px solid #27272a',
  borderRadius: '10px',
  color: '#e4e4e7',
  fontSize: '12px',
  padding: '8px 12px',
};

const DATE_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

function StatCard({
  label, value, icon, accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-zinc-500 text-xs mb-1">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{Number(value).toLocaleString()}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <p className="text-white font-semibold text-sm">{title}</p>
      {desc && <p className="text-zinc-600 text-xs mt-0.5">{desc}</p>}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center">
      <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
        <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-zinc-600 text-sm">{label}</p>
    </div>
  );
}

export default function ProjectAnalytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [eventsByName, setEventsByName] = useState<EventByName[]>([]);
  const [eventsOverTime, setEventsOverTime] = useState<TimePoint[]>([]);
  const [usersOverTime, setUsersOverTime] = useState<TimePoint[]>([]);
  const [countries, setCountries] = useState<CountryPoint[]>([]);
  const [devices, setDevices] = useState<DevicePoint[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [rangeDays, setRangeDays] = useState(30);
  const [tab, setTab] = useState<Tab>('overview');

  const applyResults = (results: Awaited<ReturnType<typeof fetchAll>>) => {
    const [proj, summ, evtName, evtTime, usrTime, ctry, dev, users] = results;
    setProject(proj.data);
    setSummary(summ.data);
    setEventsByName(evtName.data.events);
    setEventsOverTime(evtTime.data.events);
    setUsersOverTime(usrTime.data.users);
    setCountries(ctry.data.countries);
    setDevices(dev.data.devices);
    setTopUsers(users.data.users);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const d = new Date();
    d.setDate(d.getDate() - rangeDays);
    const from = d.toISOString().slice(0, 10);

    fetchAll(id, from)
      .then((results) => {
        if (cancelled) return;
        applyResults(results);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) navigate('/dashboard'); });

    return () => { cancelled = true; };
  }, [id, navigate, rangeDays]);

  const handleRefresh = async () => {
    if (!id) return;
    setRefreshing(true);
    const d = new Date();
    d.setDate(d.getDate() - rangeDays);
    const from = d.toISOString().slice(0, 10);
    try {
      applyResults(await fetchAll(id, from));
    } finally {
      setRefreshing(false);
    }
  };

  const copyApiKey = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handleRotate = async () => {
    if (!id || !confirm('Rotate API key? The old key will stop working immediately.')) return;
    setRotating(true);
    try {
      const { data } = await rotateApiKey(id);
      setProject((p) => p ? { ...p, apiKey: data.apiKey } : p);
    } finally {
      setRotating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/20 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-zinc-500 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Projects
            </button>
            <svg className="w-4 h-4 text-zinc-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium text-sm truncate">{project?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              {(['overview', 'integration'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                    tab === t ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Date range — only on overview */}
            {tab === 'overview' && (
              <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRangeDays(r.days)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      rangeDays === r.days ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            {tab === 'overview' && (
              <button
                onClick={handleRefresh}
                className={`text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-zinc-900 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

      {tab === 'integration' && project && (
        <IntegrationTab apiKey={project.apiKey} />
      )}

      {tab === 'overview' && <div className="space-y-6">

        {/* API Key */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-violet-950 border border-violet-800/50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">API Key</p>
            </div>
            <button
              onClick={() => setShowApiKey((v) => !v)}
              className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
            >
              {showApiKey ? 'Hide' : 'Reveal'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-zinc-300 bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 font-mono truncate">
              {showApiKey ? project?.apiKey : '•'.repeat(44)}
            </code>
            <button
              onClick={copyApiKey}
              className={`px-4 py-3 border rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                apiKeyCopied
                  ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              {apiKeyCopied ? '✓ Copied' : 'Copy'}
            </button>
            <button
              onClick={handleRotate}
              disabled={rotating}
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-400 hover:text-orange-400 hover:border-orange-700/40 transition-all whitespace-nowrap disabled:opacity-40"
            >
              {rotating ? 'Rotating…' : 'Rotate'}
            </button>
          </div>
        </div>

        {/* Stat cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Events"
              value={summary.totalEvents}
              accent="bg-violet-950/60 border border-violet-800/30"
              icon={<svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <StatCard
              label="Unique Users"
              value={summary.uniqueUsers}
              accent="bg-blue-950/60 border border-blue-800/30"
              icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatCard
              label="Event Types"
              value={summary.uniqueEventTypes}
              accent="bg-emerald-950/60 border border-emerald-800/30"
              icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            />
          </div>
        )}

        {/* Mobile date range */}
        <div className="flex sm:hidden items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRangeDays(r.days)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                rangeDays === r.days ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Events over time */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <SectionHeader title="Events over time" desc={`Last ${rangeDays} days`} />
          {eventsOverTime.length === 0 ? (
            <EmptyState label="No events in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={eventsOverTime}>
                <defs>
                  <linearGradient id="evtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#evtGrad)" dot={false} activeDot={{ r: 4, fill: '#7c3aed', stroke: '#a78bfa', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Users over time */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <SectionHeader title="Unique users over time" desc={`Last ${rangeDays} days`} />
          {usersOverTime.length === 0 ? (
            <EmptyState label="No user activity in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={usersOverTime}>
                <defs>
                  <linearGradient id="usrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#usrGrad)" dot={false} activeDot={{ r: 4, fill: '#3b82f6', stroke: '#93c5fd', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top events bar chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <SectionHeader title="Top events" desc="By total occurrence count" />
          {eventsByName.length === 0 ? (
            <EmptyState label="No events tracked yet" />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, eventsByName.length * 38)}>
              <BarChart data={eventsByName} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="eventName" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1f1f23' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {eventsByName.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Countries + Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <SectionHeader title="By country" />
            {countries.length === 0 ? (
              <EmptyState label="No country data" />
            ) : (
              <div className="space-y-1">
                {countries.map((c, i) => {
                  const max = countries[0].count;
                  const pct = Math.round((c.count / max) * 100);
                  return (
                    <div key={c.country} className="flex items-center gap-3 py-1.5">
                      <span className="text-zinc-600 text-xs w-4 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-zinc-300 text-sm truncate">{c.country}</span>
                          <span className="text-zinc-500 text-xs ml-2">{c.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <SectionHeader title="By device" />
            {devices.length === 0 ? (
              <EmptyState label="No device data" />
            ) : (
              <div className="space-y-1">
                {devices.map((d, i) => {
                  const max = devices[0].count;
                  const pct = Math.round((d.count / max) * 100);
                  return (
                    <div key={d.deviceType} className="flex items-center gap-3 py-1.5">
                      <span className="text-zinc-600 text-xs w-4 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-zinc-300 text-sm truncate">{d.deviceType}</span>
                          <span className="text-zinc-500 text-xs ml-2">{d.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top users */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <SectionHeader title="Top users" desc="Ranked by total event count" />
          {topUsers.length === 0 ? (
            <EmptyState label="No user data yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-zinc-600 font-medium text-xs pb-3 pr-4">#</th>
                    <th className="text-left text-zinc-600 font-medium text-xs pb-3 pr-4">Identifier</th>
                    <th className="text-left text-zinc-600 font-medium text-xs pb-3 pr-4">Type</th>
                    <th className="text-right text-zinc-600 font-medium text-xs pb-3">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((u, i) => (
                    <tr key={u.identifier} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 pr-4 text-zinc-600 text-xs">{i + 1}</td>
                      <td className="py-3 pr-4 text-zinc-300 font-mono text-xs truncate max-w-50">{u.identifier}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.isAnonymous
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-violet-900/40 border border-violet-700/30 text-violet-300'
                        }`}>
                          {u.isAnonymous ? 'anonymous' : 'identified'}
                        </span>
                      </td>
                      <td className="py-3 text-right text-zinc-300 font-medium">{u.eventCount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>}

      </main>
    </div>
  );
}
