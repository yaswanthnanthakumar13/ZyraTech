import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatLearningStyle } from '../lib/api';
import type { LearnerWorkspaceData } from '../types';

interface AnalyticsPageProps {
  workspace: LearnerWorkspaceData;
}

function formatStudyDuration(totalMinutes: number): string {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

const ACTIVITY_LABELS: Record<string, string> = {
  assessment: 'Proctored & Practice Tests',
  resource: 'Learning Hub Checkpoints',
  roadmap_stage: 'Roadmap Stages',
  revision: 'Spaced Revision Drills',
  project: 'Verified Projects',
  interview: 'Mock Interviews',
};

export function AnalyticsPage({ workspace }: AnalyticsPageProps) {
  const { skills, assessments, progressRecords, roadmap, moduleProgress } = workspace;

  const assessmentHistoryData = useMemo(() => {
    return assessments
      .filter((a) => a.status === 'completed' && a.score !== null)
      .slice()
      .reverse()
      .map((a, idx) => ({
        label: `${a.skillName} #${idx + 1}`,
        score: a.score ?? 0,
      }));
  }, [assessments]);

  const skillComparisonData = useMemo(() => {
    return skills.map((s) => ({
      name: s.skillName,
      Competency: s.verifiedScore,
      Retention: s.retentionScore,
    }));
  }, [skills]);

  const weeklyActivity = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of progressRecords) {
      const key = p.recordedAt.slice(0, 10);
      map.set(key, (map.get(key) || 0) + p.minutesSpent);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, minutes]) => ({
        date: date.slice(5),
        minutes,
      }));
  }, [progressRecords]);

  const totalMinutes = progressRecords.reduce((acc, p) => acc + p.minutesSpent, 0);
  const completedStages = roadmap?.milestones.filter((m) => m.status === 'completed').length ?? 0;
  const totalStages = roadmap?.milestones.length ?? 0;
  const roadmapPct = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const attendedModules = moduleProgress.filter((m) => m.attended).length;
  const completedModules = moduleProgress.filter((m) => m.completionPercent >= 70).length;
  const totalModules = moduleProgress.length;

  const activityBreakdown = useMemo(() => {
    const totals = new Map<string, { minutes: number; count: number }>();
    for (const p of progressRecords) {
      const curr = totals.get(p.activityType) || { minutes: 0, count: 0 };
      totals.set(p.activityType, {
        minutes: curr.minutes + p.minutesSpent,
        count: curr.count + 1,
      });
    }
    return Array.from(totals.entries())
      .map(([type, data]) => ({
        type,
        label: ACTIVITY_LABELS[type] || type,
        minutes: data.minutes,
        count: data.count,
        share: totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [progressRecords, totalMinutes]);

  const strongest = [...skills].sort((a, b) => b.verifiedScore - a.verifiedScore)[0];
  const weakest = [...skills].sort((a, b) => a.verifiedScore - b.verifiedScore)[0];
  const atRisk = skills.filter((s) => s.decayRisk !== 'low');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#18221D] dark:text-[#ECF2EE]">
          Progress, Accurate Study Time &amp; Stages Analytics
        </h2>
        <p className="text-sm text-[#5C6B63] dark:text-[#99A8A0] mt-0.5">
          Calculated strictly from verified study sessions, proctored assessments, roadmap milestones, and course module completions.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A]">
          <p className="text-xs text-[#5C6B63] dark:text-[#99A8A0]">Exact Study Time Logged</p>
          <p className="text-2xl font-bold font-mono tabular-nums mt-1 text-[#2D6A4F] dark:text-[#74C69D]">
            {formatStudyDuration(totalMinutes)}
          </p>
          <p className="text-xs text-[#5C6B63] dark:text-[#99A8A0] mt-1 tabular-nums">
            {totalMinutes} min across {progressRecords.length} sessions
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A]">
          <p className="text-xs text-[#5C6B63] dark:text-[#99A8A0]">Stages &amp; Modules Completed</p>
          <p className="text-2xl font-bold font-mono tabular-nums mt-1 text-[#18221D] dark:text-[#ECF2EE]">
            {completedStages}/{totalStages} stages ({roadmapPct}%)
          </p>
          <p className="text-xs text-[#5C6B63] dark:text-[#99A8A0] mt-1 tabular-nums">
            {completedModules}/{totalModules} modules passed · {attendedModules} attended
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A]">
          <p className="text-xs text-[#5C6B63] dark:text-[#99A8A0]">Strongest vs Weakest</p>
          <p className="text-sm font-semibold mt-1.5 text-[#2D6A4F] dark:text-[#74C69D]">
            Best: {strongest ? `${strongest.skillName} (${strongest.verifiedScore}%)` : '—'}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
            Focus: {weakest ? `${weakest.skillName} (${weakest.verifiedScore}%)` : '—'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A]">
          <p className="text-xs text-[#5C6B63] dark:text-[#99A8A0]">Learning Pace &amp; Retention</p>
          <p className="text-sm font-semibold mt-1.5 text-[#18221D] dark:text-[#ECF2EE]">
            {formatLearningStyle(workspace.profile.preferredLearningStyle)}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            {atRisk.length} skill(s) flagged for review
          </p>
        </div>
      </div>

      {/* Study Time Breakdown by Category */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A]">
        <h3 className="text-sm font-semibold text-[#18221D] dark:text-[#ECF2EE] mb-4">
          Verified Study Time Breakdown by Activity
        </h3>
        {activityBreakdown.length === 0 ? (
          <p className="text-sm text-[#5C6B63]">No study sessions logged yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityBreakdown.map((item) => (
              <div
                key={item.type}
                className="p-4 rounded-lg bg-[#F6F9F7] dark:bg-[#18211C] border border-[#E4ECE7] dark:border-[#24302A] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#18221D] dark:text-[#ECF2EE]">{item.label}</span>
                  <span className="font-mono font-semibold text-[#2D6A4F] dark:text-[#74C69D] tabular-nums">
                    {formatStudyDuration(item.minutes)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#DCE5DF] dark:bg-[#24302A] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2D6A4F] dark:bg-[#52B788]"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#5C6B63] dark:text-[#99A8A0] tabular-nums">
                  {item.count} session(s) · {item.share}% of total study time
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A]">
          <h3 className="text-sm font-semibold text-[#18221D] dark:text-[#ECF2EE] mb-4">
            Assessment Score History
          </h3>
          {assessmentHistoryData.length === 0 ? (
            <p className="text-sm text-[#5C6B63] py-12 text-center">
              Complete an assessment to view your score trajectory.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assessmentHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6B7A72" opacity={0.2} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#6B7A72" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#6B7A72" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151C18',
                      borderColor: '#2B3932',
                      borderRadius: '8px',
                      color: '#ECF2EE',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#2D6A4F" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 p-6 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A]">
          <h3 className="text-sm font-semibold text-[#18221D] dark:text-[#ECF2EE] mb-4">
            Competency vs. Retention by Skill
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6B7A72" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6B7A72" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#6B7A72" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151C18',
                    borderColor: '#2B3932',
                    borderRadius: '8px',
                    color: '#ECF2EE',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Competency" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Retention" fill="#74C69D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#151C18] border border-[#DCE5DF] dark:border-[#24302A]">
        <h3 className="text-sm font-semibold text-[#18221D] dark:text-[#ECF2EE] mb-4">
          Learning Consistency (Exact Minutes per Active Day)
        </h3>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#6B7A72" opacity={0.2} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6B7A72" />
              <YAxis tick={{ fontSize: 11 }} stroke="#6B7A72" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#151C18',
                  borderColor: '#2B3932',
                  borderRadius: '8px',
                  color: '#ECF2EE',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="minutes" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
