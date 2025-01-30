import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axios';
import { BookOpen } from 'lucide-react';
import TestModule from '../Assessments';

// interface SubtopicContent {
//   subtopic: {
//     _id: string;
//     name: string;
//     topic: {
//       _id: string;
//       name: string;
//     };
//     content: string;
//   }
// }

// interface TopicContent {
//   topic: {
//     _id: string;
//     name: string;
//     content: string;
//     subject: {
//       _id: string;
//       name: string;
//     };
//   };
// }

// interface SubjectContent {
//   subject: {
//     _id: string;
//     name: string;
//     description?: string;
//     content?: string;
//   };
// }
interface Content {
  subject?: {
    _id: string;
    name: string;
    description?: string;
    content?: string;
  };
  topic?: {
    _id: string;
    name: string;
    content: string;
    subject?: {
      _id: string; 
      name: string;
    };
  };
  subtopic?: {
    _id: string;
    name: string;
    topic: {
      _id: string;
      name: string;
    };
    content: string;
  };
}
interface TestResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
}
interface ContentDisplayProps {
  selectedId?: string;
  contentType?: 'subject' | 'topic' | 'subtopic' | 'mock-test' | 'self-assessment';
}
const ContentDisplay: React.FC<ContentDisplayProps> = ({ selectedId, contentType }) => {
  const [content, setContent] = useState<Content | null>(null);
  const [testResult, setTestResult] = useState<TestResult |null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(null);
    setTestResult(null);
    setError(null);

    const fetchContent = async () => {
      if (!selectedId || !contentType) return;
      setLoading(true);

      try {
        if (contentType === 'mock-test' || contentType === 'self-assessment') {
          const resultResponse = await axiosInstance.get(`/study/tests/results/${selectedId}`);
          if (resultResponse.data.testResult) {
            setTestResult(resultResponse.data.testResult);
            setLoading(false);
            return;
          }
        }

        const endpoints = {
          subject: `/study/subjects/${selectedId}/content`,
          topic: `/study/topics/${selectedId}/content`,
          subtopic: `/study/subtopics/${selectedId}/content`,
          'mock-test': `/study/tests/mock-tests/${selectedId}/content`,
          'self-assessment': `/study/tests/self-assessment/${selectedId}/content`
        };

        const response = await axiosInstance.get(endpoints[contentType]);
        setContent(response.data);
      }
      catch(err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedId, contentType]);
  const renderTestResult = () => {
    if (!testResult) return null;

    return (
      <div className="max-w-3xl mx-auto mt-2">
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-[rgb(3,63,106)] text-white p-3">
            <h2 className="text-lg font-bold">Previous Test Result</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-gradient-to-br from-[rgb(3,63,106)] to-[rgb(2,48,81)] p-2 rounded text-center text-white">
                <div className="text-xl font-bold">{testResult.score}%</div>
                <div className="text-xs opacity-80">Score</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded text-center text-white">
                <div className="text-xl font-bold">{testResult.correctAnswers}</div>
                <div className="text-xs opacity-80">Correct</div>
              </div>
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded text-center text-white">
                <div className="text-xl font-bold">{testResult.totalQuestions - testResult.correctAnswers}</div>
                <div className="text-xs opacity-80">Wrong</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded text-center text-white">
                <div className="text-xl font-bold">{Math.floor(testResult.timeTaken / 60)}</div>
                <div className="text-xs opacity-80">Minutes Taken</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-4">
                You have already completed this test. If you would like to retake it, please contact our support team.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-[rgb(3,63,106)] text-white px-4 py-2 rounded text-sm hover:bg-[rgb(2,48,81)]"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderParagraphs = (text: string) => {
    return text.split('\n\n').map((paragraph: string, index: number) => {
      if (paragraph.includes(':') && !paragraph.includes('\n')) {
        const [heading, ...rest] = paragraph.split(':');
        return (
          <div key={index} className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{heading.trim()}:</h2>
            {rest.length > 0 && <p className="text-gray-700">{rest.join(':').trim()}</p>}
          </div>
        );
      }
      
      if (paragraph.includes('\n') && paragraph.match(/^\d+\./)) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-decimal ml-6 my-4 space-y-2">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ul>
        );
      }
      
      return (
        <p key={index} className="text-gray-700 mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  if (!selectedId || !contentType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Welcome to Your Study Dashboard</h2>
        <p className="text-gray-500 mt-2">Select a topic from the sidebar to begin studying</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Content</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (testResult && (contentType === 'mock-test' || contentType === 'self-assessment')) {
      return renderTestResult();
    }

    if (!content) return null;

    const containerClasses = "prose max-w-none bg-white rounded-lg shadow-sm p-6";

    switch (contentType) {
      case 'mock-test':
      case 'self-assessment':
        return <TestModule testId={selectedId} testType={contentType} />;

      case 'subtopic':
        if (!content.subtopic) return null;
        return (
          <div className={containerClasses}>
            <div className="text-sm text-gray-500 mb-4">
              {content.subtopic.topic.name} / {content.subtopic.name}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{content.subtopic.name}</h1>
            {renderParagraphs(content.subtopic.content)}
          </div>
        );

      case 'subject':
        if (!content.subject) return null;
        return (
          <div className={containerClasses}>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{content.subject.name}</h1>
            {content.subject.description && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {content.subject.description}
              </p>
            )}
            {content.subject.content && renderParagraphs(content.subject.content)}
          </div>
        );

      case 'topic':
        if (!content.topic) return null;
        return (
          <div className={containerClasses}>
            {content.topic.subject && (
              <div className="text-sm text-gray-500 mb-4">
                {content.topic.subject.name} / {content.topic.name}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{content.topic.name}</h1>
            {content.topic.content && renderParagraphs(content.topic.content)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ContentDisplay;