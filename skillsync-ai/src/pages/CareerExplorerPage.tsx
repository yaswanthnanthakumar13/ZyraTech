import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Compass, GraduationCap, Search } from 'lucide-react';
import { apiFetch, type AssessmentLaunchContext, type PageRoute } from '../lib/api';
import type { CareerCompatibility, LearnerWorkspaceData } from '../types';

interface CareerExplorerPageProps {
  workspace: LearnerWorkspaceData;
  compatibilities: CareerCompatibility[];
  onWorkspaceUpdate: (ws: LearnerWorkspaceData) => void;
  onNavigate: (
    route: PageRoute,
    context?: AssessmentLaunchContext & { careerId?: string }
  ) => void;
}

export function CareerExplorerPage({
  workspace,
  compatibilities,
  onWorkspaceUpdate,
  onNavigate,
}: CareerExplorerPageProps) {
  const [query, setQuery] = useState('');
  const [selectedCareerId, setSelectedCareerId] = useState<string>(
    workspace.profile.targetCareerId || compatibilities[0]?.career.id || ''
  );
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return compatibilities;
    return compatibilities.filter(
      (c) =>
        c.career.title.toLowerCase().includes(q) ||
        c.career.category.toLowerCase().includes(q) ||
        c.career.requirements.some((r) => r.skillName.toLowerCase().includes(q))
    );
  }, [compatibilities, query]);

  const activeDetail =
    compatibilities.find((c) => c.career.id === selectedCareerId) || filtered[0] || null;

  const handleSwitchCareer = async (careerId: string) => {
    setSwitching(true);
    setError(null);
    try {
      const res = await apiFetch<{ workspace: LearnerWorkspaceData }>('/api/careers/switch', {
        method: 'POST',
        body: JSON.stringify({ targetCareerId: careerId }),
      });
      onWorkspaceUpdate(res.workspace);
      onNavigate('syllabus', { careerId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to switch career goal');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Worth-Studying Career Roles &amp; Full Guidance
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Explore high-growth engineering &amp; AI roles, structured university courses, and complete career guidance.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles or skills..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#151C18] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-2.5">
          {filtered.map((item) => {
            const isCurrentGoal = workspace.profile.targetCareerId === item.career.id;
            const isSelected = activeDetail?.career.id === item.career.id;
            return (
              <button
                key={item.career.id}
                onClick={() => setSelectedCareerId(item.career.id)}
                className={`w-full p-4 rounded-xl border text-left transition-colors ${
                  isSelected
                    ? 'bg-[#EDF5F0] dark:bg-[#16231C] border-[#2D6A4F] dark:border-[#52B788]'
                    : 'bg-white dark:bg-[#151C18] border-[#DCE5DF] dark:border-[#24302A] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.career.title}
                  </span>
                  <span className="text-sm font-mono tabular-nums font-semibold text-[#2D6A4F] dark:text-[#74C69D]">
                    {item.compatibilityScore}% match
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {item.career.category} · {item.career.courses.length} courses · ~{item.estimatedLearningHours}h effort
                  {isCurrentGoal ? ' · Active Goal' : ''}
                </p>
              </button>
            );
          })}
        </div>

        {activeDetail && (
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A] space-y-6 h-fit">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#DCE5DF] dark:border-[#24302A]">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeDetail.career.category} · {activeDetail.career.medianSalaryRange} · {activeDetail.career.demandOutlook}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeDetail.career.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {activeDetail.career.description}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Compatibility</p>
                <p className="text-3xl font-bold font-mono tabular-nums text-[#2D6A4F] dark:text-[#74C69D]">
                  {activeDetail.compatibilityScore}%
                </p>
              </div>
            </div>

            {/* Full Career Guidance */}
            {activeDetail.career.careerGuidance && (
              <div className="p-4 rounded-xl bg-[#F6F9F7] dark:bg-[#18211C] border border-[#DCE5DF] dark:border-[#24302A] space-y-1.5">
                <p className="text-xs font-semibold text-[#2D6A4F] dark:text-[#74C69D] inline-flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Full Career Guidance Strategy</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {activeDetail.career.careerGuidance}
                </p>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Required Technical Competencies</h4>
              <div className="divide-y divide-[#E4ECE7] dark:divide-[#24302A] border border-[#DCE5DF] dark:border-[#24302A] rounded-xl overflow-hidden">
                {activeDetail.career.requirements.map((req) => {
                  const met = activeDetail.metSkills.find(
                    (m) => m.skillName.toLowerCase() === req.skillName.toLowerCase()
                  );
                  const miss = activeDetail.missingSkills.find(
                    (m) => m.skillName.toLowerCase() === req.skillName.toLowerCase()
                  );
                  const current = met ? met.currentScore : miss?.currentScore || 0;
                  return (
                    <div key={req.skillName} className="px-4 py-3 flex items-center justify-between gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{req.skillName}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          {req.importance.replace('_', ' ')} · Target {req.requiredLevel}%
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono tabular-nums font-semibold ${
                          met ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        You: {current}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courses & Basic-to-High Practice Launchers */}
            {activeDetail.career.courses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#2D6A4F] dark:text-[#74C69D]" />
                    <span>Role Courses ({activeDetail.career.courses.length})</span>
                  </h4>
                  <button
                    onClick={() => onNavigate('syllabus', { careerId: activeDetail.career.id })}
                    className="text-xs font-semibold text-[#2D6A4F] dark:text-[#74C69D] hover:underline inline-flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Role Courses &amp; Syllabus</span>
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeDetail.career.courses.map((crs) => {
                    const primarySkill = crs.syllabusModules[0]?.skillFocus || activeDetail.career.requirements[0]?.skillName || 'JavaScript';
                    return (
                      <div
                        key={crs.id}
                        className="p-3.5 rounded-xl border border-[#DCE5DF] dark:border-[#24302A] bg-[#F6F9F7] dark:bg-[#18211C] text-xs space-y-2"
                      >
                        <p className="font-mono text-[#2D6A4F] dark:text-[#74C69D] font-semibold">
                          {crs.courseCode} · {crs.level} ({crs.hours}h)
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">{crs.title}</p>
                        <p className="text-slate-500 dark:text-slate-400 line-clamp-2">{crs.description}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() =>
                              onNavigate('assessments', {
                                skill: primarySkill,
                                difficulty: 'beginner',
                                assessmentType: 'mcq',
                                assessmentMode: 'practice_workplace',
                                courseCode: crs.courseCode,
                              })
                            }
                            className="px-2 py-1 rounded border border-[#DCE5DF] dark:border-[#2B3932] bg-white dark:bg-[#151C18] text-[11px] font-semibold hover:border-[#2D6A4F]"
                          >
                            Basic MCQ
                          </button>
                          <button
                            onClick={() =>
                              onNavigate('assessments', {
                                skill: primarySkill,
                                difficulty: 'advanced',
                                assessmentType: 'coding',
                                assessmentMode: 'practice_workplace',
                                courseCode: crs.courseCode,
                              })
                            }
                            className="px-2 py-1 rounded border border-[#DCE5DF] dark:border-[#2B3932] bg-white dark:bg-[#151C18] text-[11px] font-semibold hover:border-[#2D6A4F]"
                          >
                            High Coding
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Soft Skills &amp; Tools</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  Soft skills: {activeDetail.career.requiredSoftSkills.join(' · ')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tools: {activeDetail.career.recommendedTools.join(' · ')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Certifications &amp; Projects</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  Certs: {activeDetail.career.relevantCertifications.join(' · ')}
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  {activeDetail.career.projectExpectations.map((pe, i) => (
                    <li key={i}>• {pe}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE5DF] dark:border-[#24302A] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Transferable verified skills: {activeDetail.transferableSkills.join(', ') || 'None yet'}
              </div>
              {workspace.profile.targetCareerId === activeDetail.career.id ? (
                <button
                  onClick={() => onNavigate('syllabus', { careerId: activeDetail.career.id })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EDF5F0] dark:bg-[#16231C] border border-[#2D6A4F]/40 text-xs font-semibold text-[#2D6A4F] dark:text-[#74C69D]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Priority Active · Go to Role Courses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleSwitchCareer(activeDetail.career.id)}
                  disabled={switching}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2D6A4F] hover:bg-[#23533D] dark:bg-[#3B8263] dark:hover:bg-[#2D6A4F] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  <span>
                    {switching
                      ? 'Saving Priority & Redirecting...'
                      : `Set Priority & Go to ${activeDetail.career.title} Courses`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
