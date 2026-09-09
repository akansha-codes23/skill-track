import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  Building2,
  Landmark,
  Target,
  TrendingUp,
  Award,
  ClipboardCheck,
  GitCompare,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Lightbulb,
  MapPin,
} from 'lucide-react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero */}
      <section id="home" className="pt-24 pb-20 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              Smart India Hackathon 2026 — SIH26135
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              From Skills to Employment —{' '}
              <span className="text-indigo-600">Track, Improve and Get Hired.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              A centralized platform that connects students, training institutes, and government
              to track the complete journey from skill development to employment outcomes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how"
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Explore Platform
              </a>
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: Users, title: 'Students / Job Seekers', desc: 'Track skills, identify gaps, get training recommendations, and apply to matching jobs.', color: 'bg-blue-50 text-blue-600' },
              { icon: Building2, title: 'Training Institutes', desc: 'Create programs, track student progress, and record placement outcomes.', color: 'bg-teal-50 text-teal-600' },
              { icon: Landmark, title: 'Admin / Government', desc: 'Monitor skilling impact, analyze employment outcomes, and make data-driven decisions.', color: 'bg-indigo-50 text-indigo-600' },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section id="problem" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tracking employment outcomes, identifying skill gaps, and measuring the impact of
              skilling initiatives remains a major challenge.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: GitCompare, title: 'Skill Gaps Are Hard to Identify', desc: 'Students dont know which skills they need for their target jobs, and institutions cant track who needs what training.' },
              { icon: BarChart3, title: 'No Centralized Tracking', desc: 'There is no single platform that tracks the journey from skills to training to employment across all stakeholders.' },
              { icon: TrendingUp, title: 'Impact Is Hard to Measure', desc: 'Government cannot measure the effectiveness of skilling programs or employment outcomes at scale.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SkillTrack Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The complete journey from skills to employment, tracked end-to-end.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { icon: Target, label: 'Skills', desc: 'Select domain & add skills' },
              { icon: ClipboardCheck, label: 'Assessment', desc: 'Test your knowledge' },
              { icon: GitCompare, label: 'Skill Gap', desc: 'Identify missing skills' },
              { icon: GraduationCap, label: 'Training', desc: 'Get recommendations' },
              { icon: TrendingUp, label: 'Progress', desc: 'Track completion' },
              { icon: Briefcase, label: 'Jobs', desc: 'Match & apply' },
              { icon: Award, label: 'Applications', desc: 'Track status' },
              { icon: CheckCircle2, label: 'Employment', desc: 'Get hired' },
            ].map((step, i) => (
              <div key={step.label} className="relative">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mb-1">{step.label}</p>
                  <p className="text-xs text-gray-400">{step.desc}</p>
                </div>
                {i < 7 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything needed to track, analyze, and improve skilling-to-employment outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: GitCompare, title: 'Skill Gap Analysis', desc: 'Compare current skills against job requirements and identify exactly what to learn next.' },
              { icon: ClipboardCheck, title: 'Interactive Assessments', desc: 'Domain-specific MCQ assessments with instant scoring and skill-level identification.' },
              { icon: GraduationCap, title: 'Training Recommendations', desc: 'Personalized course recommendations based on identified skill gaps.' },
              { icon: Briefcase, title: 'Job Matching', desc: 'AI-powered job match scores based on your skill profile and job requirements.' },
              { icon: Award, title: 'Application Tracking', desc: 'Track applications through every stage from Applied to Selected with a visual board.' },
              { icon: BarChart3, title: 'Government Analytics', desc: 'Comprehensive dashboards for employment outcomes, skill gaps, and institute performance.' },
              { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Separate portals for students, institutes, and admin with appropriate access controls.' },
              { icon: MapPin, title: 'Geographic Filtering', desc: 'Filter data by state and district for targeted policy decisions.' },
              { icon: Lightbulb, title: 'Learning Paths', desc: 'Recommended learning paths based on missing skills and target job roles.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits for Everyone</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">For Students</h3>
              </div>
              <ul className="space-y-3">
                {['Know exactly which skills you need', 'Get personalized training recommendations', 'See your skill gap in real-time', 'Apply to jobs that match your skills', 'Track every application visually', 'Record employment outcomes'].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Institutes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">For Training Institutes</h3>
              </div>
              <ul className="space-y-3">
                {['Create and manage training programs', 'Track student enrollment and progress', 'Measure completion rates', 'Record placement outcomes', 'Showcase institute performance', 'Improve program quality with data'].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Government */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">For Government</h3>
              </div>
              <ul className="space-y-3">
                {['Measure skilling program effectiveness', 'Track employment outcomes nationwide', 'Identify domain-wise skill gaps', 'Compare institute performance', 'Filter by state and district', 'Make data-driven policy decisions'].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section id="stats" className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Statistics</h2>
            <p className="text-indigo-200">Real impact, measurable outcomes.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '2,400+', label: 'Registered Candidates' },
              { value: '1,680+', label: 'Trained Candidates' },
              { value: '70%', label: 'Training Completion Rate' },
              { value: '58%', label: 'Employment Rate' },
              { value: '5+', label: 'Training Institutes' },
              { value: '20+', label: 'Training Programs' },
              { value: '8', label: 'Skill Domains' },
              { value: '20+', label: 'Job Opportunities' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-indigo-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join SkillTrack today and take the first step from skills to employment. Create your
            account, select your domain, and get personalized recommendations instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Login to Your Account
            </Link>
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-lg inline-block">
            <p className="text-sm text-gray-500">
              <strong>Demo Accounts:</strong> student@demo.com / institute@demo.com / admin@demo.com — Password: demo123
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
