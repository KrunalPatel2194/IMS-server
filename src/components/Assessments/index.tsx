import  { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../context/authContext';
import { AxiosError } from 'axios';
interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface Test {
  name: string;
  questions: Question[];
}
const ActualTestModule = ({ testId, testType }: { testId: string; testType: 'mock-test' | 'self-assessment' }) => {
  const {user} = useAuth();
  const [test, setTest] = useState<Test|null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [flagged, setFlagged] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const endpoint = testType === 'self-assessment' 
          ? `/study/tests/self-assessment/${testId}/content`
          : `/study/tests/mock-tests/${testId}/content`;
        const response = await axiosInstance.get(endpoint);
        setTest(response.data[testType === 'self-assessment' ? 'selfAssessment' : 'mockTest']);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test:', error);
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, testType]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTestSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
  
    try {
      const results = calculateResults();
  
      // Send test results to the backend
      const response = await axiosInstance.post('/study/tests/results', {
        userId: user?._id,
        testId,
        testType,
        answers: Object.fromEntries(Object.entries(answers)),
        score: results.percentage,
        totalQuestions: results.total,
        correctAnswers: results.correct,
        timeTaken: 3600 - timeRemaining,
        flaggedQuestions: flagged, // Maintain flagged logic
      });
  
      if (response.status === 201) {
        setShowResults(true);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return;
        }
        setSubmitError(error.response?.data?.message || 'Failed to submit test');
      } else if (error instanceof Error) {
        setSubmitError(error.message || 'An unknown error occurred');
      } else {
        setSubmitError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: value });
  };

  const toggleFlag = (index: number) => {
    setFlagged(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const calculateResults = () => {
    let correct = 0;
    Object.entries(answers).forEach(([index, answer]) => {
      if (test?.questions[Number(index)].correctAnswer === answer) correct++;
    });
    return {
      total: test?.questions.length,
      answered: Object.keys(answers).length,
      correct,
      percentage: test?.questions.length ? Math.round((correct / test?.questions.length) * 100) : 0
    };
  };

  if (loading) return <div className="flex justify-center p-2">Loading...</div>;
  if (!test) return <div className="flex justify-center p-2">Test not found</div>;
  if (submitError) {
    return (
      <div className="max-w-3xl mx-auto mt-2">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <p className="block sm:inline"> {submitError}</p>
          <button 
            onClick={() => handleTestSubmission()}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Retrying...' : 'Retry Submission'}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const totalQuestions = test.questions.length;
  const formatTime = (seconds: number) => 
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  // Rest of the component remains the same...
  if (showResults) {
    const results = calculateResults();
    return (
      <div className="max-w-3xl mx-auto mt-2">
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-[rgb(3,63,106)] text-white p-3">
            <h2 className="text-lg font-bold">Test Summary</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-gradient-to-br from-[rgb(3,63,106)] to-[rgb(2,48,81)] p-2 rounded text-center text-white">
                <div className="text-xl font-bold">{results.percentage}%</div>
                <div className="text-xs opacity-80">Score</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded text-center text-white">
                <div className="text-xl font-bold">{results.correct}</div>
                <div className="text-xs opacity-80">Correct</div>
              </div>
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded text-center text-white">
                <div className="text-xl font-bold">{(results.total ?? 0) - (results.correct ?? 0)}</div>
                <div className="text-xs opacity-80">Wrong</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded text-center text-white">
                <div className="text-xl font-bold">{flagged.length}</div>
                <div className="text-xs opacity-80">Flagged</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                }}
                className="flex-1 bg-[rgb(3,63,106)] text-white py-1.5 rounded hover:bg-[rgb(2,48,81)] text-xs"
              >
                Review All
              </button>
              <button 
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(flagged[0] || 0);
                }}
                className="flex-1 border border-[rgb(3,63,106)] text-[rgb(3,63,106)] py-1.5 rounded hover:bg-[rgb(3,63,106)] hover:text-white text-xs"
                disabled={!flagged.length}
              >
                Review Flagged
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-2">
      <div className="bg-white rounded shadow-sm">
        <div className="bg-[rgb(3,63,106)] text-white px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-medium">{test.name}</h2>
              <p className="text-xs opacity-80">{testType === 'self-assessment' ? 'Self Assessment' : 'Mock Test'}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-sm font-medium">{formatTime(timeRemaining)}</div>
                <div className="text-xs opacity-80">Time</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{Object.keys(answers).length}/{totalQuestions}</div>
                <div className="text-xs opacity-80">Done</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900">Q{currentQuestionIndex + 1}</h3>
                <button 
                  onClick={() => toggleFlag(currentQuestionIndex)}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    flagged.includes(currentQuestionIndex)
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  {flagged.includes(currentQuestionIndex) ? 'Flagged' : 'Flag'}
                </button>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                answers[currentQuestionIndex] 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {answers[currentQuestionIndex] ? 'Answered' : 'Pending'}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded mb-3 text-sm">
              {currentQuestion.questionText}
            </div>
            <div className="space-y-2">
              {currentQuestion.options.map((option: string, index: number) => (
                <div 
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`p-2 border rounded cursor-pointer ${
                    answers[currentQuestionIndex] === option
                      ? 'border-[rgb(3,63,106)] bg-[rgb(3,63,106,0.05)]'
                      : 'border-gray-200 hover:border-[rgb(3,63,106,0.5)]'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full border ${
                      answers[currentQuestionIndex] === option
                        ? 'border-[rgb(3,63,106)] bg-[rgb(3,63,106)]'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestionIndex] === option && (
                        <div className="w-1 h-1 m-auto rounded-full bg-white"/>
                      )}
                    </div>
                    <label className="ml-2 text-xs text-gray-700 cursor-pointer select-none">
                      {option}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs disabled:opacity-50"
            >
              Previous
            </button>
            
            {currentQuestionIndex === totalQuestions - 1 ? (
              <button 
                onClick={handleTestSubmission}
                disabled={Object.keys(answers).length !== totalQuestions || isSubmitting}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-3 py-1 bg-[rgb(3,63,106)] text-white rounded text-xs"
              >
                Next
              </button>
            )}
          </div>

          <div className="pt-2 border-t">
            <div className="flex gap-3 mb-1 text-[10px] text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Answered
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                Flagged
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                Not Visited
              </div>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {test.questions.map((_, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    h-6 rounded text-[10px] font-medium
                    ${currentQuestionIndex === index ? 'ring-1 ring-[rgb(3,63,106)]' : ''}
                    ${answers[index] 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : flagged.includes(index)
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestModule = ({ testId, testType }: { testId: string; testType: 'mock-test' | 'self-assessment' }) => {
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto mt-2">
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-[rgb(3,63,106)] text-white p-3">
            <h2 className="text-lg font-bold">Test Overview</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
              <h3 className="text-sm font-semibold text-gray-900">Instructions</h3>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>• Total duration: 60 minutes</li>
                  <li>• You cannot pause the test once started</li>
                  <li>• All questions are multiple choice</li>
                  <li>• You can flag questions to review later</li>
                  <li>• Submit only when you've attempted all questions</li>
                </ul>
              </div>
              
              <div className="pt-4 border-t">
                <button 
                  onClick={() => setHasStarted(true)}
                  className="w-full bg-[rgb(3,63,106)] text-white py-2 rounded hover:bg-[rgb(2,48,81)] 
                           transition-colors font-medium"
                >
                  Start Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ActualTestModule testId={testId} testType={testType} />;
};

export default TestModule;