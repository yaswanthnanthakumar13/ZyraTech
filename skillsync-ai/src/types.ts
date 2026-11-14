export type VerificationStatus =
  | 'self_declared'
  | 'assessment_verified'
  | 'project_verified';

export type DecayRisk = 'low' | 'moderate' | 'high';

export type LearningStyle =
  | 'hands_on_projects'
  | 'interactive_coding'
  | 'video_tutorials'
  | 'documentation_reading';

export type UserRole = 'student' | 'admin';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr';

export interface User {
  id: string;
  email: string;
  rollNumber: string;
  role: UserRole;
  fullName: string;
  preferredLanguage: SupportedLanguage;
  isDemo: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface LearnerProfile {
  userId: string;
  educationLevel: string;
  institution: string;
  university: string;
  githubUrl: string;
  linkedinUrl: string;
  nonTechnicalSkills: string[];
  certifications: string[];
  previousProjects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  workExperience: string;
  careerInterests: string[];
  targetCareerId: string;
  dailyLearningMinutes: number;
  preferredLearningStyle: LearningStyle;
  resumeText: string;
  streakDays: number;
  onboardingCompleted: boolean;
  updatedAt: string;
}

export interface SkillDNA {
  id: string;
  userId: string;
  skillName: string;
  category: string;
  selfDeclaredScore: number;
  verifiedScore: number;
  verificationStatus: VerificationStatus;
  theoryScore: number;
  practicalScore: number;
  problemSolvingScore: number;
  projectScore: number;
  retentionScore: number;
  lastPracticedAt: string;
  decayRisk: DecayRisk;
  weakConcepts: string[];
  updatedAt: string;
}

export interface CareerSkillRequirement {
  skillName: string;
  requiredLevel: number;
  importance: 'core' | 'important' | 'nice_to_have';
  category: string;
}

export interface RoleCourse {
  id: string;
  careerId: string;
  courseCode: string;
  title: string;
  level: 'Foundation' | 'Core' | 'Applied' | 'Capstone';
  credits: number;
  hours: number;
  description: string;
  syllabusModules: Array<{
    moduleCode: string;
    title: string;
    topics: string[];
    skillFocus: string;
    codingExercise?: {
      title: string;
      prompt: string;
      starterCode: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    };
  }>;
  prerequisites: string[];
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  medianSalaryRange: string;
  demandOutlook: string;
  careerGuidance: string;
  requiredSoftSkills: string[];
  recommendedTools: string[];
  relevantCertifications: string[];
  projectExpectations: string[];
  requirements: CareerSkillRequirement[];
  courses: RoleCourse[];
}

export interface CareerCompatibility {
  career: CareerRole;
  compatibilityScore: number;
  indicativeReadinessEstimate: number;
  metSkills: Array<{
    skillName: string;
    currentScore: number;
    requiredLevel: number;
    verificationStatus: VerificationStatus;
  }>;
  missingSkills: Array<{
    skillName: string;
    currentScore: number;
    requiredLevel: number;
    gap: number;
    importance: string;
  }>;
  transferableSkills: string[];
  estimatedLearningHours: number;
}

export interface AssessmentQuestion {
  id: string;
  questionIndex: number;
  questionType: 'mcq' | 'coding' | 'conceptual' | 'debugging' | 'scenario';
  prompt: string;
  codeSnippet: string | null;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
  careerLogic?: string;
  conceptTag: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  aiEvaluation: string | null;
}

export interface SkillAssessment {
  id: string;
  userId: string;
  adminAssessmentId: string | null;
  title: string;
  skillName: string;
  careerId: string;
  courseCode: string;
  moduleCode: string;
  assessmentMode: 'daily_portal' | 'practice_workplace';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  assessmentType: 'mixed' | 'mcq' | 'coding' | 'conceptual' | 'debugging' | 'scenario' | 'project_coding';
  status: 'in_progress' | 'completed' | 'terminated_proctoring';
  score: number | null;
  totalQuestions: number;
  correctCount: number | null;
  tabSwitchCount: number;
  weakConcepts: string[];
  feedback: string | null;
  createdAt: string;
  completedAt: string | null;
  questions?: AssessmentQuestion[];
}

export interface AdminAssessment {
  id: string;
  title: string;
  careerId: string;
  skillName: string;
  courseCode: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  passingScore: number;
  maxTabSwitches: number;
  isPublished: boolean;
  createdBy: string;
  questions: Array<{
    questionType: 'mcq' | 'coding' | 'conceptual' | 'debugging' | 'scenario';
    prompt: string;
    codeSnippet?: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    careerLogic?: string;
    conceptTag: string;
  }>;
  createdAt: string;
}

export interface ProctoringLog {
  id: string;
  userId: string;
  studentName?: string;
  rollNumber?: string;
  assessmentId: string;
  assessmentTitle: string;
  switchCount: number;
  eventType: 'tab_switch' | 'fullscreen_exit' | 'window_blur' | 'terminated';
  details: string;
  createdAt: string;
}

export interface SyllabusRecommendation {
  id: string;
  userId: string;
  careerId: string;
  courseCode: string;
  courseTitle: string;
  moduleCode: string;
  recommendedModuleTitle: string;
  skillFocus: string;
  rationale: string;
  topics: string[];
  estimatedHours: number;
  priority: 'critical' | 'recommended' | 'enrichment';
  createdAt: string;
}

export interface RoadmapMilestone {
  id: string;
  roadmapId: string;
  stageOrder: number;
  skillName: string;
  title: string;
  learningObjective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  status: 'locked' | 'available' | 'in_progress' | 'needs_revision' | 'completed';
  completionCriteria: string;
  practicalExercise: string;
  miniProject: string;
  isReusableTransfer: boolean;
  assessmentRequired: boolean;
  lastAssessmentScore: number | null;
  adaptedNote: string | null;
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  careerId: string;
  careerTitle: string;
  status: string;
  compatibilityScore: number;
  readinessEstimate: number;
  estimatedTotalHours: number;
  adaptationReason: string;
  createdAt: string;
  updatedAt: string;
  milestones: RoadmapMilestone[];
}

export interface LearningResource {
  id: string;
  skillName: string;
  title: string;
  provider: string;
  resourceType: 'youtube' | 'documentation' | 'course' | 'practice' | 'opensource' | 'article';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningStyle: LearningStyle;
  url: string;
  description: string;
  estimatedMinutes: number;
  isVerifiedUrl: boolean;
  bookmarked?: boolean;
}

export interface ProgressRecord {
  id: string;
  userId: string;
  activityType: 'assessment' | 'roadmap_stage' | 'revision' | 'project' | 'resource' | 'interview';
  skillName: string;
  title: string;
  minutesSpent: number;
  score: number | null;
  recordedAt: string;
}

export interface AgentOutputRecord {
  agentName: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
}

export interface AIAgentDecision {
  id: string;
  userId: string;
  triggerEvent: string;
  orchestratorSummary: string;
  agentOutputs: AgentOutputRecord[];
  nextAction: string;
  explanation: string;
  createdAt: string;
}

export interface CareerGoalHistoryItem {
  id: string;
  userId: string;
  fromCareerId: string | null;
  toCareerId: string;
  compatibilityBefore: number;
  compatibilityAfter: number;
  preservedSkills: string[];
  changedAt: string;
}

export interface MentorMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  contextTag: string | null;
  createdAt: string;
}

export interface RevisionScheduleItem {
  id: string;
  userId: string;
  skillName: string;
  reason: string;
  urgency: 'low' | 'moderate' | 'high';
  dueDate: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface LearnerProject {
  id: string;
  userId: string;
  title: string;
  skillName: string;
  careerId: string;
  description: string;
  submissionNotes: string;
  repoOrDemoLink: string;
  aiVerificationScore: number | null;
  aiFeedback: string | null;
  status: 'in_progress' | 'verified';
  createdAt: string;
}

export interface MockInterviewMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: string;
}

export interface MockInterviewEvaluation {
  technicalAccuracy: number;
  problemSolvingApproach: number;
  explanationQuality: number;
  communicationStructure: number;
  responseClarityIndicator: number;
  eyeContactScore?: number;
  screenFocusScore?: number;
  strengths: string[];
  improvementAreas: string[];
  summary: string;
  disclaimer: string;
}

export interface MockInterview {
  id: string;
  userId: string;
  careerId: string;
  interviewType: 'technical' | 'coding' | 'behavioral' | 'career_specific';
  messages: MockInterviewMessage[];
  evaluation: MockInterviewEvaluation | null;
  readinessScore: number | null;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface ModuleProgressItem {
  courseCode: string;
  courseTitle: string;
  moduleCode: string;
  moduleTitle: string;
  skillFocus: string;
  completionPercent: number;
  attended: boolean;
  latestScore: number | null;
}

export interface LearnerWorkspaceData {
  user: User;
  profile: LearnerProfile;
  skills: SkillDNA[];
  roadmap: LearningRoadmap | null;
  assessments: SkillAssessment[];
  publishedTests: AdminAssessment[];
  upcomingSyllabus: SyllabusRecommendation[];
  proctoringLogs: ProctoringLog[];
  progressRecords: ProgressRecord[];
  agentDecisions: AIAgentDecision[];
  careerHistory: CareerGoalHistoryItem[];
  revisions: RevisionScheduleItem[];
  projects: LearnerProject[];
  bookmarks: string[];
  interviews: MockInterview[];
  compatibility: CareerCompatibility | null;
  moduleProgress: ModuleProgressItem[];
}

export interface AdminDashboardData {
  admin: User;
  assessments: AdminAssessment[];
  students: Array<{
    id: string;
    rollNumber: string;
    email: string;
    fullName: string;
    targetCareerId: string;
    completedAssessments: number;
    avgScore: number;
    proctoringViolations: number;
    terminatedTests: number;
  }>;
  proctoringLogs: ProctoringLog[];
  recentSubmissions: Array<{
    id: string;
    studentName: string;
    rollNumber: string;
    title: string;
    skillName: string;
    score: number | null;
    status: string;
    tabSwitchCount: number;
    completedAt: string | null;
  }>;
}
