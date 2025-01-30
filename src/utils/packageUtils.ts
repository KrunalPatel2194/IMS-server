// src/utils/packageUtils.ts

export const getPackageFeatures = (type: string): string[] => {
    switch(type) {
      case 'content_only':
        return [
          'Access to all study materials',
          'Progress tracking',
          'Self-assessment tools',
          'Study notes and summaries'
        ];
      case 'mock_access':
        return [
          'Full-length mock tests',
          'Detailed performance analytics',
          'Question bank access',
          'Timed test environment'
        ];
      case 'full_access':
        return [
          'All study materials',
          'Full-length mock tests',
          'Performance analytics',
          'Question bank access',
          'Progress tracking',
          'Priority support'
        ];
      default:
        return [];
    }
  };