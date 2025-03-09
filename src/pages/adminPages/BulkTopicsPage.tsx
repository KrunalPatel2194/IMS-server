import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronRight, Save, Code } from 'lucide-react';
import axiosInstance from '../../utils/axios';

interface FieldOfStudy {
  _id: string;
  name: string;
}


interface Exam {
  _id: string;
  name: string;
  fieldOfStudy: FieldOfStudy;
}

interface Subject {
  _id: string;
  name: string;
  exam: Exam;
}

interface TopicInput {
  id: string;
  name: string;
  content: string;
  isPublic: boolean;
  subtopics: SubtopicInput[];
}

interface SubtopicInput {
  id: string;
  name: string;
  content: string;
  isPublic: boolean;
}
interface AIResponse {
  content: string;
  _id: string;
}

interface GeneratedContent {
  content: string;
  _id: string;
}

interface ParsedContent {
  fieldOfStudy: { title: string };
  exam: { id: string; title: string };
  subject: { id: string; title: string };
  topics: Array<{
    name: string;
    content: string;
    isPublic: boolean;
    subtopics: Array<{
      name: string;
      content: string;
      isPublic: boolean;
    }>;
  }>;
}
const BulkTopicsPage = () => {
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [topics, setTopics] = useState<TopicInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [generationStatus, setGenerationStatus] = useState('idle');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [isContentGenerated, setIsContentGenerated] = useState(false);
  const [buttonState, setButtonState] = useState({
    state: 'idle',
    message: 'Generate with AI'
  });

  useEffect(() => {
    fetchFieldsOfStudy();
  }, []);

  useEffect(() => {
    if (selectedFieldId) {
      fetchExams(selectedFieldId);
      setSelectedExamId('');
      setSelectedSubjectId('');
    }
  }, [selectedFieldId]);

  useEffect(() => {
    if (selectedExamId) {
      fetchSubjects(selectedExamId);
      setSelectedSubjectId('');
    }
  }, [selectedExamId]);

  const fetchFieldsOfStudy = async () => {
    try {
      const response = await axiosInstance.get('/admin-main/fields-of-study');
      setFieldsOfStudy(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch fields of study');
    }
  };

  const fetchExams = async (fieldId: string) => {
    try {
      const response = await axiosInstance.get(`/admin-main/exams?fieldOfStudy=${fieldId}`);
      setExams(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
    }
  };

  const fetchSubjects = async (examId: string) => {
    try {
      const response = await axiosInstance.get(`/admin-main/subjects?examId=${examId}`);
      setSubjects(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subjects');
    }
  };

  const addTopic = () => {
    const newTopic: TopicInput = {
      id: Date.now().toString(),
      name: '',
      content: '',
      isPublic: false,
      subtopics: []
    };
    setTopics([...topics, newTopic]);
  };

  const addSubtopic = (topicId: string) => {
    const newSubtopic: SubtopicInput = {
      id: Date.now().toString(),
      name: '',
      content: '',
      isPublic: false
    };
    setTopics(topics.map(topic => 
      topic.id === topicId 
        ? { ...topic, subtopics: [...topic.subtopics, newSubtopic] }
        : topic
    ));
  };

  const updateTopic = (topicId: string, field: keyof TopicInput, value: any) => {
    setTopics(topics.map(topic =>
      topic.id === topicId ? { ...topic, [field]: value } : topic
    ));
  };

  const updateSubtopic = (topicId: string, subtopicId: string, field: keyof SubtopicInput, value: any) => {
    setTopics(topics.map(topic =>
      topic.id === topicId ? {
        ...topic,
        subtopics: topic.subtopics.map(subtopic =>
          subtopic.id === subtopicId ? { ...subtopic, [field]: value } : subtopic
        )
      } : topic
    ));
  };

  const removeTopic = (topicId: string) => {
    setTopics(topics.filter(topic => topic.id !== topicId));
  };

  const removeSubtopic = (topicId: string, subtopicId: string) => {
    setTopics(topics.map(topic =>
      topic.id === topicId ? {
        ...topic,
        subtopics: topic.subtopics.filter(subtopic => subtopic.id !== subtopicId)
      } : topic
    ));
  };

  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopics(prevExpanded =>
      prevExpanded.includes(topicId)
        ? prevExpanded.filter(id => id !== topicId)
        : [...prevExpanded, topicId]
    );
  };

  const generateJsonStructure = () => {
    const selectedField = fieldsOfStudy.find(f => f._id === selectedFieldId);
    const selectedExam = exams.find(e => e._id === selectedExamId);
    const selectedSubject = subjects.find(s => s._id === selectedSubjectId);

    return {
      fieldOfStudy: {
        id: selectedField?._id || '',
        title: selectedField?.name || ''
      },
      exam: {
        id: selectedExam?._id || '',
        title: selectedExam?.name || ''
      },
      subject: {
        id: selectedSubject?._id || '',
        title: selectedSubject?.name || ''
      },
      topics: topics.map(topic => ({
        name: topic.name,
        content: '',
        isPublic: false,
        subtopics: topic.subtopics.map(subtopic => ({
          name: subtopic.name,
          content: '',
          isPublic: false
        }))
      }))
    };
  };
  interface GeneratedContent {
    _id: string;
    content: string;
  }
  
  const parseAIResponse = (aiResponse: string): ParsedContent => {
    const topics: Array<{
      name: string;
      content: string;
      isPublic: boolean;
      subtopics: Array<{
        name: string;
        content: string;
        isPublic: boolean;
      }>;
    }> = [];
  
    let currentTopic: {
      name: string;
      content: string;
      isPublic: boolean;
      subtopics: Array<{
        name: string;
        content: string;
        isPublic: boolean;
      }>;
    } | null = null;
  
    let currentSubtopic: {
      name: string;
      content: string;
      isPublic: boolean;
    } | null = null;
  
    let contentLines: string[] = [];
    const lines = aiResponse.split('\n');
  
    for (const line of lines) {
      const trimmedLine = line.trim();
  
      if (trimmedLine.startsWith('Topic:')) {
        if (currentTopic && currentSubtopic) {
          currentSubtopic.content = contentLines.join('\n');
          contentLines = [];
        }
  
        currentTopic = {
          name: trimmedLine.replace('Topic:', '').trim(),
          content: '',
          isPublic: false,
          subtopics: []
        };
        topics.push(currentTopic);
        currentSubtopic = null;
      } 
      else if (trimmedLine.startsWith('Subtopic:')) {
        if (currentSubtopic) {
          currentSubtopic.content = contentLines.join('\n');
          contentLines = [];
        }
  
        if (currentTopic) {
          currentSubtopic = {
            name: trimmedLine.replace('Subtopic:', '').trim(),
            content: '',
            isPublic: false
          };
          currentTopic.subtopics.push(currentSubtopic);
        }
      }
      else if (trimmedLine && !trimmedLine.startsWith('Exam:') && !trimmedLine.startsWith('Subject:')) {
        contentLines.push(trimmedLine);
      }
    }
  
    // Handle last subtopic content
    if (currentSubtopic && contentLines.length > 0) {
      currentSubtopic.content = contentLines.join('\n');
    }
  
    return {
      fieldOfStudy: { title: "Medicine" },
      exam: { id: "", title: "" },
      subject: { id: "", title: "" },
      topics
    };
  };
  const handleAuditTrail = async (type: 'submit' | 'generate') => {
    if (!selectedSubjectId || topics.length === 0) {
      setError(!selectedSubjectId ? 'Please select a subject' : 'Please add at least one topic');
      return;
    }
  
    try {
      setIsLoading(true);
      setGenerationStatus('processing');
      setButtonState({ state: 'generating', message: 'Generating content...' });
      
      const jsonData = generateJsonStructure();
      const response = await axiosInstance.post('/admin-main/content-audit', {
        type,
        content: jsonData
      });
  
      const interval = setInterval(async () => {
        try {
          const statusResponse = await axiosInstance.get(`/admin-main/content-audit/${response.data.auditId}`);
          const { status, aiResponse, _id } = statusResponse.data.data;
  
          if (status === 'completed') {
            clearInterval(interval);
            setGenerationStatus('completed');
            setGeneratedContent({ content: aiResponse, _id }); // Store both the response and ID
            setIsContentGenerated(true);
            setButtonState({ state: 'completed', message: 'Generation Complete' });
            setSuccessMessage('Content generated successfully');
          } else if (status === 'failed') {
            clearInterval(interval);
            setGenerationStatus('idle');
            setButtonState({ state: 'idle', message: 'Generate with AI' });
            setError('AI content generation failed');
          }
        } catch (err) {
          clearInterval(interval);
          setGenerationStatus('idle');
          setButtonState({ state: 'idle', message: 'Generate with AI' });
          setError('Failed to check generation status');
        }
      }, 2000);
  
      setPollInterval(interval);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start generation');
      setGenerationStatus('idle');
      setButtonState({ state: 'idle', message: 'Generate with AI' });
    } finally {
      setIsLoading(false);
    }
  };
  const handleFormatAndSave = async () => {
    try {
      if (!generatedContent) {
        setError('No content has been generated yet');
        return;
      }
  
      setIsLoading(true);
      
      // Parse the AI response
      const parsedContent = parseAIResponse(generatedContent.content);
      console.log(parsedContent ,"parsed COntent")
      
      // Make the API call with the parsed content
      await axiosInstance.post(`/admin-main/content-audit/${generatedContent._id}/parse`, parsedContent);
      
      setSuccessMessage('Content formatted and saved successfully');
      setIsContentGenerated(false);
      setButtonState({ state: 'idle', message: 'Generate with AI' });
    } catch (err) {
      setError('Failed to format and save content');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);
  


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Topics Creation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add multiple topics and subtopics at once
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field of Study
            </label>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select field of study</option>
              {fieldsOfStudy.map((field) => (
                <option key={field._id} value={field._id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Exam
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedFieldId}
            >
              <option value="">Select an exam</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedExamId}
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!showReview ? (
          <div className="space-y-6">
            {topics.map((topic) => (
              <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                  <input
    type="text"
    placeholder="Topic Title"
    value={topic.name}
    onChange={(e) => updateTopic(topic.id, 'name', e.target.value)}
    disabled={isContentGenerated}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
      isContentGenerated ? 'bg-gray-100 text-gray-500' : 'focus:ring-blue-500 focus:border-blue-500'
    }`}
  />
                  </div>
                  <button
                    onClick={() => removeTopic(topic.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="ml-6 space-y-4">
                  {topic.subtopics.map((subtopic) => (
                    <div key={subtopic.id} className="flex items-start">
                      <div className="flex-1 mr-4">
                        <input
                          type="text"
                          placeholder="Subtopic Title"
                          value={subtopic.name}
                          onChange={(e) => updateSubtopic(topic.id, subtopic.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => removeSubtopic(topic.id, subtopic.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSubtopic(topic.id)}
                    className="ml-2 text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Subtopic
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-6">
              <button
                onClick={addTopic}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Topic
              </button>

              {topics.length > 0 && (
                <div className="space-x-4">
                  <button
                    onClick={() => setShowJson(!showJson)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    <Code className="w-4 h-4 inline-block mr-2" />
                    {showJson ? 'Hide JSON' : 'View JSON'}
                  </button>
                  <button
                    onClick={() => setShowReview(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <ChevronRight className="w-4 h-4 inline-block mr-2" />
                    Review
                  </button>
                </div>
              )}
            </div>

            {showJson && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">JSON Structure</h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-sm">
                  {JSON.stringify(generateJsonStructure(), null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Content</h3>
            
            <div className="border border-gray-200 rounded-lg p-4">
              {topics.map((topic) => (
                <div key={topic.id} className="mb-4">
                  <div
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => toggleTopicExpansion(topic.id)}
                  >
                    {expandedTopics.includes(topic.id) ? (
                      <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />
                    )}
                    <span className="font-medium text-gray-900">{topic.name}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({topic.subtopics.length} subtopics)
                    </span>
                  </div>
                  
                  {expandedTopics.includes(topic.id) && (
                    <div className="ml-6 mt-2 space-y-2">
                      {topic.subtopics.map((subtopic) => (
                        <div key={subtopic.id} className="flex items-center p-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                          <span className="text-gray-700">{subtopic.name}</span>
                        </div>
                      ))}
                      {topic.subtopics.length === 0 && (
                        <div className="text-sm text-gray-500 italic ml-4">
                          No subtopics added
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
    <div className="space-x-4">
      {!isContentGenerated ? (
        <button
          onClick={() => handleAuditTrail('generate')}
          disabled={buttonState.state !== 'idle'}
          className={`px-4 py-2 ${
            buttonState.state === 'idle' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-400'
          } text-white rounded-md flex items-center space-x-2`}
        >
          {buttonState.state === 'generating' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          <span>{buttonState.message}</span>
        </button>
      ) : (
        <button
          onClick={handleFormatAndSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Format and Save</span>
        </button>
      )}
    </div>
  </div>
  {generationStatus === 'completed' && generatedContent && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    <h4 className="text-lg font-medium text-gray-900 mb-2">Generated Content</h4>
    <pre className="whitespace-pre-wrap text-sm text-gray-700">
      {generatedContent.content}
    </pre>
  </div>
)}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default BulkTopicsPage;