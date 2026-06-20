// Re-export all API services from api.js for backward compatibility
export {
  authAPI,
  studentAPI,
  teacherAPI,
  attendanceAPI,
  assignmentAPI,
  examAPI,
  feeAPI,
  noticeAPI,
  notificationAPI,
  analyticsAPI,
  aiAPI,
  leaveAPI,
  timetableAPI,
  parentAPI,
} from './api'

export { default } from './api'

export const leaveService = {
  apply: (data) => api.post('/api/leaves/apply', data),
  getMyLeaves: () => api.get('/api/leaves/my'),
  getPending: () => api.get('/api/leaves/pending'),
  processLeave: (data) => api.post('/api/leaves/action', data),
  getAll: (params) => api.get('/api/leaves/all', { params }),
};

export const noticeService = {
  create: (data) => api.post('/api/notices/', data),
  getAll: (params) => api.get('/api/notices/', { params }),
  getById: (id) => api.get(`/api/notices/${id}`),
  delete: (id) => api.delete(`/api/notices/${id}`),
};

export const examService = {
  create: (data) => api.post('/api/exams/', data),
  createPractical: (data) => api.post('/api/exams/practical', data),
  getAll: (params) => api.get('/api/exams/', { params }),
  getUpcoming: () => api.get('/api/exams/upcoming'),
  uploadMarks: (data) => api.post('/api/exams/marks/upload', data),
  bulkUploadMarks: (data) => api.post('/api/exams/marks/bulk', data),
  getStudentMarks: (studentId) => api.get(`/api/exams/marks/student/${studentId}`),
};

export const timetableService = {
  create: (data) => api.post('/api/timetable/', data),
  getByClass: (classId) => api.get(`/api/timetable/class/${classId}`),
  getMine: () => api.get('/api/timetable/my'),
};

export const analyticsService = {
  getStudentAnalytics: (studentId) => api.get(`/api/analytics/student/${studentId}`),
  getTeacherClassAnalytics: (classId) => api.get(`/api/analytics/teacher/class/${classId}`),
  getAdminOverview: () => api.get('/api/analytics/admin/overview'),
  exportStudents: () => api.get('/api/analytics/admin/export/students', { responseType: 'blob' }),
};

export const aiService = {
  getPrediction: (studentId) => api.get(`/api/ai/predict/performance/${studentId}`),
  getAttendancePrediction: (studentId) => api.get(`/api/ai/predict/attendance/${studentId}`),
  getRecommendations: (studentId) => api.get(`/api/ai/recommendations/${studentId}`),
  getAIDashboard: (studentId) => api.get(`/api/ai/dashboard/${studentId}`),
};

export const chatbotService = {
  sendMessage: (message, conversationId) =>
    api.post('/api/chatbot/chat', { message, conversation_id: conversationId }),
  getHistory: (conversationId) =>
    api.get('/api/chatbot/history', { params: { conversation_id: conversationId } }),
};

export const notificationService = {
  getAll: (params) => api.get('/api/notifications/', { params }),
  markRead: (id) => api.post(`/api/notifications/${id}/read`),
  markAllRead: () => api.post('/api/notifications/read-all'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
};

export const parentService = {
  getChildInfo: () => api.get('/api/parents/child/info'),
  getChildAttendance: () => api.get('/api/parents/child/attendance'),
  getChildFees: () => api.get('/api/parents/child/fees'),
  getChildMarks: () => api.get('/api/parents/child/marks'),
  getChildNotifications: () => api.get('/api/parents/child/notifications'),
};

export const teacherService = {
  getAll: (params) => api.get('/api/teachers/', { params }),
  getById: (id) => api.get(`/api/teachers/${id}/profile`),
  update: (id, data) => api.put(`/api/teachers/${id}`, data),
  delete: (id) => api.delete(`/api/teachers/${id}`),
  getMyClasses: () => api.get('/api/teachers/my-classes'),
};
