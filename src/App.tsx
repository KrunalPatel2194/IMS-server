import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProtectedRoute from './routes/protectedRoute';
import Layout from './components/Layout/Layout';
import { useAuth } from './context/authContext';

// Eager loaded components
import DashboardPage from './pages/dashboard';
import AdminPage from './pages/adminPages/AdminPage';
import FieldOfStudyPage from './pages/adminPages/FieldOfStudyPage';
import ExamPage from './pages/adminPages/ExamPage';
import TopicsPage from './pages/adminPages/topicsPage';
import SubjectsPage from './pages/adminPages/subjectsPage';
import SubtopicsPage from './pages/adminPages/subTopicsPage';
// import ExamPage from './pages/adminPages/ExamPage';

// Lazy loaded components for Study Content
// const ViewStudyContent = React.lazy(() => import('./pages/studyContent/ViewContent'));
// const AddStudyContent = React.lazy(() => import('./pages/studyContent/AddContent'));
// const AddAIStudyContent = React.lazy(() => import('./pages/studyContent/AddAIContent'));

// Lazy loaded components for Exam Content
// const ViewExamContent = React.lazy(() => import('./pages/examContent/ViewTests'));
// const AddExamContent = React.lazy(() => import('./pages/examContent/AddTests'));
// const AddAIExamContent = React.lazy(() => import('./pages/examContent/AddAITests'));

// Login component
const Login = React.lazy(() => import('./pages/login'));

function App() {
  const { isAuthenticated, setupSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      setupSession();
    }
  }, [isAuthenticated, setupSession]);

  // Handle unauthenticated state
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Login />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Main authenticated routes
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Manage Public Content routes */}
        <Route path="admins">
          <Route path="admins" element={<AdminPage />} />
          <Route path="field-of-study" element={<FieldOfStudyPage />} />
          <Route path="exam" element={<ExamPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="subtopics" element={<SubtopicsPage />} />



          {/* <Route path="exam" element={<ExamPage />} /> */}
        </Route>

        {/* Study Content routes */}
        <Route path="study-content">
          <Route path="view" element={
            <Suspense fallback={<div>Loading...</div>}>
              {/* <ViewStudyContent /> */}
            </Suspense>
          } />
          <Route path="add" element={
            <Suspense fallback={<div>Loading...</div>}>
              {/* <AddStudyContent /> */}
            </Suspense>
          } />
          <Route path="add-ai" element={
            <Suspense fallback={<div>Loading...</div>}>
              {/* <AddAIStudyContent /> */}
            </Suspense>
          } />
        </Route>

        {/* Exam Content routes */}
        <Route path="exam-content">
          <Route path="view" element={
            <Suspense fallback={<div>Loading...</div>}>
              {/* <ViewExamContent /> */}
            </Suspense>
          } />
          <Route path="add" element={
            <Suspense fallback={<div>Loading...</div>}>
              {/* <AddExamContent /> */}
            </Suspense>
          } />
          <Route path="add-ai" element={
            <Suspense fallback={<div>Loading...</div>}>
              {/* <AddAIExamContent /> */}
            </Suspense>
          } />
        </Route>

        {/* Redirect root to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route for authenticated users */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;