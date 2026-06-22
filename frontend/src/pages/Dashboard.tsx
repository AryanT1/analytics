import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { listProjects, createProject, deleteProject } from '../api/project';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../types';

function ProjectCard({
  project,
  onView,
  onDelete,
}: {
  project: Project;
  onView: () => void;
  onDelete: () => void;
}) {
  const created = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const initials = project.name.slice(0, 2).toUpperCase();
  const hues = ['bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600'];
  const color = hues[project.name.charCodeAt(0) % hues.length];

  return (
    <div
      onClick={onView}
      className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-violet-700/60 hover:bg-zinc-900/80 transition-all duration-200 relative overflow-hidden"
    >
      {/* subtle glow on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-900/0 to-violet-900/0 group-hover:from-violet-900/10 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-2xl" />

      <div className="flex items-start justify-between mb-5">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {initials}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <p className="text-white font-semibold text-base mb-1 group-hover:text-violet-300 transition-colors">
        {project.name}
      </p>
      <p className="text-zinc-600 text-xs font-mono truncate mb-4">
        {project.apiKey.slice(0, 20)}••••••••
      </p>

      <div className="flex items-center justify-between">
        <span className="text-zinc-600 text-xs">{created}</span>
        <span className="text-violet-400 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View analytics
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onCreate(name.trim());
    } catch (err) {
      setError(
        axios.isAxiosError<{ error: string }>(err)
          ? (err.response?.data?.error ?? 'Failed to create project')
          : 'Failed to create project',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-base">New project</h2>
            <p className="text-zinc-500 text-sm mt-0.5">A new API key will be generated for you</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Project name</label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. My SaaS App"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium py-3 rounded-xl transition-colors"
            >
              {loading ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await listProjects();
      setProjects(data.projects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (name: string) => {
    await createProject(name);
    setShowCreate(false);
    await load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This removes all its events.`)) return;
    await deleteProject(id);
    setProjects((p) => p.filter((x) => x.id !== id));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const emailName = user?.email.split('@')[0] ?? '';

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                {emailName[0]?.toUpperCase()}
              </div>
              <span className="text-zinc-400 text-xs">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="text-zinc-500 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {greeting()}, {emailName} 👋
          </h1>
          <p className="text-zinc-500 mt-1.5">
            {projects.length > 0
              ? `You have ${projects.length} project${projects.length !== 1 ? 's' : ''}. Select one to view analytics.`
              : 'Create your first project to start tracking events.'}
          </p>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-600 text-sm font-medium uppercase tracking-wider">
            Projects
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-lg shadow-violet-900/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-2">No projects yet</p>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs">
              Create a project to get an API key and start tracking events from your app.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => navigate(`/project/${project.id}`)}
                onDelete={() => handleDelete(project.id, project.name)}
              />
            ))}
            {/* Add new card */}
            <button
              onClick={() => setShowCreate(true)}
              className="h-44 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-600 hover:border-violet-700/50 hover:text-violet-500 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-xl border-2 border-dashed border-zinc-700 group-hover:border-violet-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium">New project</span>
            </button>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
