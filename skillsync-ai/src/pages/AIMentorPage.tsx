import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BookOpenCheck, Send, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { playPopSound } from '../lib/sound';
import type { LearnerWorkspaceData, MentorMessage } from '../types';

interface AIMentorPageProps {
  workspace: LearnerWorkspaceData;
}

const QUICK_PROMPTS = [
  'Explain JavaScript closures and async/await using Python analogies.',
  'Give me a step-by-step career guidance roadmap for my target role.',
  'Help me debug a recursive backtracking algorithm in DSA.',
  'Suggest a 15-minute study plan for my weakest course module.',
];

export function AIMentorPage({ workspace }: AIMentorPageProps) {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    apiFetch<MentorMessage[]>('/api/mentor/history')
      .then((data) => setMessages(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load mentor history'))
      .finally(() => setLoadingHistory(false));
  }, [workspace.user.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    playPopSound('action');
    setError(null);
    setSending(true);
    const optimistic: MentorMessage = {
      id: `temp-${Date.now()}`,
      userId: workspace.user.id,
      role: 'user',
      content: text.trim(),
      contextTag: 'chat',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');

    try {
      const res = await apiFetch<{ history: MentorMessage[] }>('/api/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text.trim() }),
      });
      setMessages(res.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mentor could not respond');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const weakConcepts = workspace.skills.flatMap((s) => s.weakConcepts).slice(0, 6);

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)] min-h-[540px]">
      {/* Context & Educational Policy Sidebar */}
      <aside className="lg:col-span-4 p-5 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A] flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-[#2D6A4F] dark:text-[#74C69D]">
              Academic &amp; Career Guidance Agent
            </p>
            <h2 className="text-lg font-bold text-[#18221D] dark:text-[#ECF2EE] mt-0.5">
              ZyraTech AI Mentor
            </h2>
            <p className="text-xs text-[#5C6B63] dark:text-[#99A8A0] mt-1 leading-relaxed">
              Reads your live Skill DNA, university courses, weak concepts, and career goal before answering.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#EDF5F0] dark:bg-[#16231C] border border-[#CFE2D6] dark:border-[#243B2E] space-y-1.5 text-xs">
            <p className="font-semibold text-[#1B4332] dark:text-[#95D5B2] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Strict Educational-Only Scope</span>
            </p>
            <p className="text-[#4B5952] dark:text-[#A9B7AF] leading-relaxed">
              Answers strictly cover career guidance, coding, university courses, exams, and study plans. Off-topic or inappropriate requests are declined automatically.
            </p>
          </div>

          <div className="pt-4 border-t border-[#DCE5DF] dark:border-[#24302A] space-y-2 text-xs">
            <p className="font-semibold text-[#18221D] dark:text-[#ECF2EE]">Active Student Context</p>
            <p className="text-[#4B5952] dark:text-[#A9B7AF]">
              Target Career: {workspace.compatibility?.career.title || workspace.profile.targetCareerId} ({workspace.compatibility?.compatibilityScore ?? 0}%)
            </p>
            <p className="text-[#4B5952] dark:text-[#A9B7AF]">
              Language: {(workspace.user.preferredLanguage || 'en').toUpperCase()}
            </p>
            <p className="text-[#4B5952] dark:text-[#A9B7AF]">
              Focus Concepts: {weakConcepts.length > 0 ? weakConcepts.join(', ') : 'All fundamentals healthy'}
            </p>
          </div>

          <div className="pt-4 border-t border-[#DCE5DF] dark:border-[#24302A] space-y-2">
            <p className="text-xs font-semibold text-[#18221D] dark:text-[#ECF2EE]">
              Suggested Academic Prompts
            </p>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={sending}
                  className="w-full text-left p-2.5 rounded-lg border border-[#DCE5DF] dark:border-[#24302A] hover:border-[#2D6A4F] dark:hover:border-[#52B788] text-xs text-[#18221D] dark:text-[#ECF2EE] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Conversation Area */}
      <div className="lg:col-span-8 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A] flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-[#DCE5DF] dark:border-[#24302A] bg-[#FAFDFB] dark:bg-[#121815] flex items-center justify-between text-xs text-[#5C6B63] dark:text-[#99A8A0]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#2D6A4F] dark:text-[#74C69D]">
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Career Guidance · Coding · Studies · Courses Only</span>
          </span>
          <span>Multilingual Tutor Active</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {loadingHistory ? (
            <p className="text-sm text-[#5C6B63]">Loading mentor conversation...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-[#5C6B63]">
              Ask a question about coding, coursework, exams, or career guidance to get started.
            </p>
          ) : (
            messages.map((m) => {
              const isRefusal = m.role === 'assistant' && m.contextTag === 'guardrail_refusal';
              return (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#2D6A4F] dark:bg-[#3B8263] text-white'
                        : isRefusal
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                          : 'bg-[#F3F7F4] dark:bg-[#19221D] text-[#18221D] dark:text-[#ECF2EE] border border-[#DCE5DF] dark:border-[#24302A]'
                    }`}
                  >
                    {isRefusal && (
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-1">
                        Educational Scope Guardrail
                      </p>
                    )}
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          {sending && (
            <div className="text-xs text-[#5C6B63] dark:text-[#99A8A0]">
              ZyraTech Mentor is checking your academic context and composing guidance...
            </div>
          )}
          <div ref={endRef} />
        </div>

        {error && (
          <div className="px-5 py-2 text-xs text-red-600 dark:text-red-400 border-t border-[#DCE5DF] dark:border-[#24302A]">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#DCE5DF] dark:border-[#24302A] flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about coding, studies, university courses, or career guidance..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#DCE5DF] dark:border-[#2B3932] bg-[#FAFDFB] dark:bg-[#101613] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2D6A4F] hover:bg-[#23533D] dark:bg-[#3B8263] dark:hover:bg-[#2D6A4F] text-white text-sm font-semibold disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
