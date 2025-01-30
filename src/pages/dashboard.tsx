import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';
import Sidebar from '../components/Sidebar';
import ContentDisplay from '../components/Study/content';
import axiosInstance from '../utils/axios';

type ContentType = 'subject' | 'topic' | 'subtopic' | 'mock-test' | 'self-assessment';

interface StudyData {
  examId: string;
  subscriptionStatus: string | null;
  sideBarContent: Array<{
    type: string;
    selfContent: Array<any>;
  }>;
}

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  

  return (
    <div className="flex min-h-full">
    </div>
  );
};

export default DashboardPage;