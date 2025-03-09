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
import BulkTopicsPage from './pages/adminPages/BulkTopicsPage';
import GenerateContentPage from './pages/adminPages/GenerateContentPage';
import VisitorsPage from './pages/Security/visitorsPage';
import UsersPage from './pages/Principal/usersPage';
import SchoolsPage from './pages/Principal/schoolsPage';
import StudentsPage from './pages/Office/studentsPage';
import FeeCollectionPage from './pages/Office/FeeCollection/feeCollectionPage';
import RawMaterialsPage from './pages/Inventory/rawMaterialsPage';
import SuppliersPage from './pages/Inventory/supplierPage';
import OrdersPage from './pages/Inventory/orderPage';
import StockPage from './pages/Inventory/stockPage';
import ProductManagementPage from './pages/Production/ProductManagementPage';
import ProductionManagementPage from './pages/Production/ProductionManagementPage';
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
          <Route path="bulk-add-content" element={<BulkTopicsPage />} />
          <Route path="generate-content" element={<GenerateContentPage />} />





        </Route>
        <Route path="security">
          <Route path="visitors" element={<VisitorsPage />} />
        </Route>

        <Route path="inventory">
        <Route path="suppliers" element={<SuppliersPage />} />

          <Route path="rawmaterials" element={<RawMaterialsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="stock" element={<StockPage />} />


        </Route>
        <Route path="sales">
        <Route path="products" element={<ProductManagementPage />} />
        <Route path="production" element={<ProductionManagementPage />} />


         


        </Route>
        <Route path="manage">
          <Route path="staff" element={<UsersPage />} />
          <Route path="school" element={<SchoolsPage />} />

        </Route>
        <Route path="manage">
          <Route path="fees" element={<UsersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="feecollection" element={<FeeCollectionPage />} />


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