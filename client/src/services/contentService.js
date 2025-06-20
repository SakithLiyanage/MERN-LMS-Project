import api from '../utils/api';

export const fetchContent = async (contentType, courseId) => {
  try {
    console.log(`Fetching ${contentType} for course ${courseId}`);
    let endpoint = `/${contentType}`;
    
    if (courseId) {
      // For most content types, use query param
      endpoint = `/${contentType}?courseId=${courseId}`;
      
      // For some content types that use a different route pattern
      if (['notices', 'materials', 'assignments', 'quizzes'].includes(contentType)) {
        // Try both formats to ensure compatibility
        try {
          const response = await api.get(`/${contentType}/course/${courseId}`);
          return response.data;
        } catch (err) {
          console.log(`Course-specific endpoint failed, trying with query param`);
          const response = await api.get(endpoint);
          return response.data;
        }
      }
    }
    
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    throw error;
  }
};

// Specific content type fetchers
export const fetchMaterials = (courseId) => fetchContent('materials', courseId);
export const fetchAssignments = (courseId) => fetchContent('assignments', courseId);
export const fetchQuizzes = (courseId) => fetchContent('quizzes', courseId);
export const fetchNotices = (courseId) => fetchContent('notices', courseId);
