import api from './api';

export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  registerStudent: (data) => api.post('/api/auth/register/student', data),
  registerTeacher: (data) => api.post('/api/auth/register/teacher', data),
  registerParent: (data) => api.post('/api/auth/register/parent', data),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, new_password) => api.post('/api/auth/reset-password', { token, new_password }),
  changePassword: (current_password, new_password) =>
    api.post('/api/auth/change-password', { current_password, new_password }),
  getMe: () => api.get('/api/auth/me'),
};

export const studentService = {
  getAll: (params) => api.get('/api/students/', { params }),
  getProfile: () => api.get('/api/students/profile'),
  updateProfile: (data) => api.put('/api/students/profile', data),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/students/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getStats: () => api.get('/api/students/stats/overview'),
};

export const attendanceService = {
  mark: (data) => api.post('/api/attendance/mark', data),
  markBulk: (data) => api.post('/api/attendance/mark/bulk', data),
  getStudentAttendance: (studentId, params) =>
    api.get(`/api/attendance/student/${studentId}`, { params }),
  getClassAttendance: (classId, params) =>
    api.get(`/api/attendance/class/${classId}`, { params }),
  getSubjectWise: (studentId) =>
    api.get(`/api/attendance/subject-wise/${studentId}`),
};

export const assignmentService = {
  create: (data) => api.post('/api/assignments/', data),
  getAll: (params) => api.get('/api/assignments/', { params }),
  getById: (id) => api.get(`/api/assignments/${id}`),
  update: (id, data) => api.put(`/api/assignments/${id}`, data),
  submit: (id, formData) => api.post(`/api/assignments/submit/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSubmissions: (id) => api.get(`/api/assignments/${id}/submissions`),
  grade: (data) => api.post('/api/assignments/grade', data),
};

export const feeService = {
  create: (data) => api.post('/api/fees/', data),
  getStudentFees: (studentId) => api.get(`/api/fees/student/${studentId}`),
  pay: (data) => api.post('/api/fees/pay', data),
  downloadReceipt: (feeId) =>
    api.get(`/api/fees/${feeId}/receipt`, { responseType: 'blob' }),
  getOverdue: () => api.get('/api/fees/overdue/all'),
};

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
