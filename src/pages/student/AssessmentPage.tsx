import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  Target,
} from 'lucide-react';

import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { domainService } from '@/services/dataService';
import { supabase } from '@/lib/supabase';

import type { AssessmentQuestion, AssessmentResult } from '@/types';

export default function AssessmentPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState('');

  const domain = user?.domainId
    ? domainService.getById(user.domainId)
    : undefined;

  // Load assessment questions from Supabase
    useEffect(() => {
    const loadQuestions = async () => {
      if (!domain) {
        setQuestions([]);
        setLoadingQuestions(false);
        return;
      }

      setLoadingQuestions(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('domain_id', domain.id);

      if (fetchError) {
        console.error(
          'Error loading assessment questions:',
          fetchError
        );
        setError('Unable to load assessment questions.');
        setQuestions([]);
        setLoadingQuestions(false);
        return;
      }

      const mappedQuestions: AssessmentQuestion[] = (data || []).map(
        (question) => {
          let correctAnswer = 0;

          if (typeof question.correct_answer === 'number') {
            correctAnswer = question.correct_answer;
          } else if (
            typeof question.correct_answer === 'string' &&
            !Number.isNaN(Number(question.correct_answer))
          ) {
            correctAnswer = Number(question.correct_answer);
          } else if (Array.isArray(question.options)) {
            const matchingIndex = question.options.findIndex(
              (option: string) =>
                option === question.correct_answer
            );

            if (matchingIndex >= 0) {
              correctAnswer = matchingIndex;
            }
          }

          return {
            id: String(question.id),
            domainId: String(question.domain_id),
            skillId: String(question.skill_id || ''),
            question: question.question,
            options: question.options || [],
            correctAnswer,
            skillName: question.skill_name || 'General Skill',
          };
        }
      );

      setQuestions(mappedQuestions);
      setLoadingQuestions(false);
    };

    loadQuestions();
  }, [domain?.id]);
  if (!user) {
    return null;
  }

  if (!domain) {
    return (
      <DashboardLayout>
        <div className="bg-amber-50 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            Please select a domain first.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (loadingQuestions) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              Loading assessment questions...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-8 text-center">
            <p className="text-gray-700">
              No assessment questions are available for this domain yet.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleStart = () => {
    setStarted(true);
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setResult(null);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      return;
    }

    // Calculate results
    const correct = newAnswers.filter(
      (answer, index) =>
        answer === questions[index].correctAnswer
    ).length;

    const score = Math.round(
      (correct / questions.length) * 100
    );

    const skillMap: Record<string, number> = {};

    questions.forEach((question, index) => {
      if (!skillMap[question.skillName]) {
        skillMap[question.skillName] = 0;
      }

      if (
        newAnswers[index] === question.correctAnswer
      ) {
        skillMap[question.skillName] += 1;
      }
    });

    const allSkills = Object.keys(skillMap);

    const strongSkills = allSkills.filter(
      (skill) => skillMap[skill] > 0
    );

    const weakSkills = allSkills.filter(
      (skill) => skillMap[skill] === 0
    );

    const recommendedSkills =
      weakSkills.length > 0
        ? weakSkills
        : allSkills.slice(0, 2);

    const assessmentResult: AssessmentResult = {
      id: `ar${Date.now()}`,
      userId: user.id,
      domainId: domain.id,
      score,
      totalQuestions: questions.length,
      strongSkills,
      weakSkills,
      recommendedSkills,
      takenAt: new Date().toISOString(),
    };

    // Save assessment result to Supabase
    const { error: resultError } = await supabase
      .from('assessment_results')
      .insert({
        id: assessmentResult.id,
        user_id: user.id,
        domain_id: domain.id,
        score,
        total_questions: questions.length,
        completed_at: assessmentResult.takenAt,
      });

    if (resultError) {
      console.error(
        'Error saving assessment result:',
        resultError
      );
    }

    // Update user skill score in Supabase
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        skill_score: score,
      })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error(
        'Error updating user skill score:',
        userUpdateError
      );
    }

    updateUser({
      skillScore: score,
    });

    setResult(assessmentResult);
  };

  // Start screen
  if (!started && !result) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Skill Assessment
            </h2>

            <p className="text-gray-500 mb-6">
              Domain:{' '}
              <span className="font-medium text-indigo-600">
                {domain.name}
              </span>
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {questions.length}
                </p>
                <p className="text-xs text-gray-500">
                  Questions
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                  <Clock className="w-5 h-5" /> 10
                </p>
                <p className="text-xs text-gray-500">
                  Minutes
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-900">
                  MCQ
                </p>
                <p className="text-xs text-gray-500">
                  Format
                </p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                <strong>Instructions:</strong> Answer all
                questions to the best of your ability. You'll
                receive a score, identify your strong and weak
                skills, and get recommendations for improvement.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Result screen
  if (result) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 text-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                result.score >= 70
                  ? 'bg-green-50'
                  : result.score >= 50
                  ? 'bg-amber-50'
                  : 'bg-red-50'
              }`}
            >
              <Award
                className={`w-10 h-10 ${
                  result.score >= 70
                    ? 'text-green-600'
                    : result.score >= 50
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Assessment Complete!
            </h2>

            <p className="text-gray-500 mb-4">
              You answered {result.score}% correctly (
              {
                answers.filter(
                  (answer, index) =>
                    answer === questions[index].correctAnswer
                ).length
              }{' '}
              out of {result.totalQuestions})
            </p>

            <div className="text-5xl font-bold text-indigo-600 mb-6">
              {result.score}%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Strong Skills
              </h3>

              {result.strongSkills.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No strong skills identified yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.strongSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Weak Skills
              </h3>

              {result.weakSkills.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No weak skills. Great job!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.weakSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommended Skills to Improve
            </h3>

            <div className="flex flex-wrap gap-2">
              {result.recommendedSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-white text-indigo-700 rounded-full text-sm border border-indigo-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleStart}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Retake Assessment
            </button>

            <button
              onClick={() =>
                navigate('/student/skill-gap')
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              View Skill Gap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Question screen
  const q = questions[currentQ];
  const progress =
    ((currentQ + 1) / questions.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Question {currentQ + 1} of {questions.length}
            </span>

            <span>
              {Math.round(progress)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-2">
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {q.skillName}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {q.question}
          </h3>

          <div className="space-y-3">
            {q.options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  setSelectedAnswer(index)
                }
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                      selectedAnswer === index
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>

                  <span className="text-sm text-gray-700">
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQ + 1 === questions.length
                ? 'Submit'
                : 'Next'}

              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}