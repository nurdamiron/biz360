# BIZ360 API Examples

This document provides practical examples for working with the BIZ360 API for frontend developers.

## Table of Contents

1. [Authentication](#authentication)
2. [Task Management](#task-management)
3. [Calendar Events](#calendar-events)
4. [Bonus System](#bonus-system)
5. [Document Templates](#document-templates)
6. [Working with Other Modules](#working-with-other-modules)

## Authentication

### Register a New User

```javascript
// Example: Register a new user (company owner)
const registerUser = async () => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'SecurePassword123',
      name: 'John Doe',
      company_name: 'Example Corp',
      phone: '+77001234567',
      role: 'owner'
    }),
  });
  
  const data = await response.json();
  console.log(data);
  
  // Example response:
  // {
  //   "success": true,
  //   "message": "Registration successful. Please verify your email.",
  //   "data": {
  //     "userId": 123,
  //     "email": "user@example.com",
  //     "verificationToken": "token123"
  //   }
  // }
};
```

### User Login

```javascript
// Example: User login
const loginUser = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'SecurePassword123'
    }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens in localStorage or other secure storage
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }
  
  return data;
  
  // Example response:
  // {
  //   "success": true,
  //   "data": {
  //     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  //     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  //     "user": {
  //       "id": 123,
  //       "name": "John Doe",
  //       "email": "user@example.com",
  //       "role": "admin",
  //       "company_id": 45,
  //       "department_id": 2
  //     }
  //   }
  // }
};
```

### Refresh Token

```javascript
// Example: Refresh the access token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.error('No refresh token found');
    return null;
  }
  
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken
    }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data.accessToken;
  } else {
    // Token refresh failed, user needs to log in again
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};
```

### Authenticated API Request Helper

```javascript
// Example: API request helper with token handling
const apiRequest = async (url, options = {}) => {
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization token if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized error (token expired)
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    // If token refresh successful, retry the request
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    } else {
      // Token refresh failed, redirect to login
      window.location.href = '/login';
      return null;
    }
  }
  
  return response.json();
};
```

## Task Management

### Get User's Tasks

```javascript
// Example: Get tasks assigned to the current user
const getMyTasks = async () => {
  try {
    const data = await apiRequest('/api/tasks/my');
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "tasks": [
    //       {
    //         "id": 1,
    //         "title": "Complete project proposal",
    //         "status": "in_progress",
    //         "priority": "high",
    //         "due_date": "2025-04-15T00:00:00.000Z",
    //         "created_by": 123,
    //         "creator": {
    //           "id": 123,
    //           "name": "John Manager"
    //         }
    //       },
    //       // More tasks...
    //     ],
    //     "total": 5
    //   }
    // }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
};
```

### Create a New Task

```javascript
// Example: Create a new task
const createTask = async (taskData) => {
  try {
    const data = await apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};

// Example usage
const newTask = {
  title: "Prepare sales presentation",
  description: "Create slides for the quarterly sales meeting",
  status: "open",
  priority: "medium",
  due_date: "2025-04-20",
  assigned_to: 456, // Employee ID
  category: "presentation",
  related_to: "customer",
  related_id: 789 // Customer ID
};

createTask(newTask).then(response => {
  if (response && response.success) {
    console.log('Task created:', response.data.task);
  }
});
```

### Update Task Status

```javascript
// Example: Update the status of a task
const updateTaskStatus = async (taskId, newStatus) => {
  try {
    const data = await apiRequest(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: newStatus
      }),
    });
    
    return data;
  } catch (error) {
    console.error('Error updating task status:', error);
    return null;
  }
};

// Example usage
updateTaskStatus(1, 'done').then(response => {
  if (response && response.success) {
    console.log('Task status updated:', response.data.task);
  }
});
```

### Add Comment to Task

```javascript
// Example: Add a comment to a task
const addTaskComment = async (taskId, comment) => {
  try {
    const data = await apiRequest(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        comment
      }),
    });
    
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

// Example usage
addTaskComment(1, 'I have started working on this task. Will update tomorrow.')
  .then(response => {
    if (response && response.success) {
      console.log('Comment added:', response.data.comment);
    }
  });
```

### Get Task with Comments

```javascript
// Example: Get task details including comments
const getTaskWithComments = async (taskId) => {
  try {
    const data = await apiRequest(`/api/tasks/${taskId}`);
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "task": {
    //       "id": 1,
    //       "title": "Complete project proposal",
    //       "description": "Draft a proposal for the new client project",
    //       "status": "in_progress",
    //       "priority": "high",
    //       "due_date": "2025-04-15T00:00:00.000Z",
    //       "created_by": 123,
    //       "assigned_to": 456,
    //       "creator": { ... },
    //       "assignee": { ... },
    //       "comments": [
    //         {
    //           "id": 1,
    //           "user_id": 123,
    //           "comment": "How is the progress on this?",
    //           "created_at": "2025-04-03T09:00:00.000Z",
    //           "user": { ... }
    //         }
    //       ]
    //     }
    //   }
    // }
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
};
```

## Calendar Events

### Get User's Calendar Events

```javascript
// Example: Get calendar events for the current user
const getMyEvents = async (startFrom, startTo) => {
  try {
    let url = '/api/calendar/my';
    const params = new URLSearchParams();
    
    if (startFrom) {
      params.append('startFrom', startFrom);
    }
    
    if (startTo) {
      params.append('startTo', startTo);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const data = await apiRequest(url);
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "events": [
    //       {
    //         "id": 1,
    //         "title": "Weekly Team Meeting",
    //         "start_time": "2025-04-10T14:00:00.000Z",
    //         "end_time": "2025-04-10T15:00:00.000Z",
    //         "location": "Conference Room A",
    //         "status": "planned",
    //         "type": "meeting",
    //         "attendees": [ ... ]
    //       },
    //       // More events...
    //     ],
    //     "total": 3
    //   }
    // }
  } catch (error) {
    console.error('Error fetching events:', error);
    return null;
  }
};

// Example usage
const today = new Date();
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

getMyEvents(
  today.toISOString().split('T')[0], 
  nextWeek.toISOString().split('T')[0]
).then(response => {
  if (response && response.success) {
    console.log('Events:', response.data.events);
  }
});
```

### Create Calendar Event

```javascript
// Example: Create a new calendar event
const createEvent = async (eventData) => {
  try {
    const data = await apiRequest('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    
    return data;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

// Example usage
const newEvent = {
  title: "Client Presentation",
  description: "Present Q1 results to client",
  start_time: "2025-04-15T10:00:00",
  end_time: "2025-04-15T11:30:00",
  location: "Client Office",
  status: "planned",
  priority: "high",
  type: "meeting",
  is_all_day: false,
  color: "#ff7700",
  related_to: "customer",
  related_id: 789,
  attendees: [123, 456, 789] // User IDs
};

createEvent(newEvent).then(response => {
  if (response && response.success) {
    console.log('Event created:', response.data.event);
  }
});
```

### Update Attendee Status

```javascript
// Example: Update your attendance status for an event
const updateAttendanceStatus = async (eventId, status) => {
  try {
    const data = await apiRequest(`/api/calendar/${eventId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status // 'pending', 'accepted', 'declined', 'maybe'
      }),
    });
    
    return data;
  } catch (error) {
    console.error('Error updating attendance status:', error);
    return null;
  }
};

// Example usage
updateAttendanceStatus(2, 'accepted').then(response => {
  if (response && response.success) {
    console.log('Attendance status updated:', response.data.attendee);
  }
});
```

### Get Events for a Task

```javascript
// Example: Get all calendar events related to a specific task
const getTaskEvents = async (taskId) => {
  try {
    const data = await apiRequest(`/api/calendar/task/${taskId}`);
    return data;
  } catch (error) {
    console.error('Error fetching task events:', error);
    return null;
  }
};

// Example usage
getTaskEvents(5).then(response => {
  if (response && response.success) {
    console.log('Task events:', response.data.events);
  }
});
```

## Bonus System

### Get Bonus Schemes

```javascript
// Example: Get available bonus schemes
const getBonusSchemes = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add any filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    
    let url = '/api/bonus/schemes';
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const data = await apiRequest(url);
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "schemes": [
    //       {
    //         "id": 1,
    //         "name": "Sales Commission - Standard",
    //         "calculation_type": "percentage",
    //         "percentage": 5,
    //         "min_threshold": 1000,
    //         "max_cap": 10000,
    //         "applies_to": "order",
    //         "active": true,
    //         "rules": [ ... ]
    //       },
    //       // More schemes...
    //     ],
    //     "total": 5
    //   }
    // }
  } catch (error) {
    console.error('Error fetching bonus schemes:', error);
    return null;
  }
};

// Example usage
getBonusSchemes({
  active: true,
  department: 3, // Sales department
  calculationType: 'percentage'
}).then(response => {
  if (response && response.success) {
    console.log('Bonus schemes:', response.data.schemes);
  }
});
```

### Calculate Potential Bonus

```javascript
// Example: Calculate potential bonus for an order
const calculatePotentialBonus = async (orderId, employeeId) => {
  try {
    const data = await apiRequest('/api/bonus/calculate', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        employeeId
      }),
    });
    
    return data;
  } catch (error) {
    console.error('Error calculating bonus:', error);
    return null;
  }
};

// Example usage
calculatePotentialBonus(123, 456).then(response => {
  if (response && response.success) {
    console.log('Bonus calculation:', response.data.calculation);
  }
});
```

### Get Employee Bonus Statistics

```javascript
// Example: Get bonus statistics for an employee
const getEmployeeBonusStats = async (employeeId, periodType = 'month', limit = 6) => {
  try {
    const data = await apiRequest(`/api/bonus/employee/${employeeId}/statistics?periodType=${periodType}&limit=${limit}`);
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "employeeId": 456,
    //     "employeeName": "Jane Employee",
    //     "totalBonuses": 145000,
    //     "averageBonus": 18125,
    //     "topBonus": 25000,
    //     "periodicData": [
    //       {
    //         "period": "2025-04",
    //         "periodName": "April 2025",
    //         "totalAmount": 18000,
    //         "count": 1
    //       },
    //       // More periods...
    //     ]
    //   }
    // }
  } catch (error) {
    console.error('Error fetching bonus statistics:', error);
    return null;
  }
};

// Example usage
getEmployeeBonusStats(456, 'month', 6).then(response => {
  if (response && response.success) {
    console.log('Employee bonus stats:', response.data);
    
    // Example: Using the data to create a chart
    const labels = response.data.periodicData.map(item => item.periodName);
    const amounts = response.data.periodicData.map(item => item.totalAmount);
    
    // createChart(labels, amounts);
  }
});
```

### Assign Bonus to Employee

```javascript
// Example: Manually assign a bonus to an employee
const assignBonus = async (bonusData) => {
  try {
    const data = await apiRequest('/api/bonus/assign', {
      method: 'POST',
      body: JSON.stringify(bonusData),
    });
    
    return data;
  } catch (error) {
    console.error('Error assigning bonus:', error);
    return null;
  }
};

// Example usage
const bonusData = {
  employee_id: 456,
  scheme_id: 3,
  amount: 5000,
  description: "Performance bonus for Q1",
  related_to: "performance",
  status: "pending",
  notes: "Awarded for exceeding Q1 sales targets"
};

assignBonus(bonusData).then(response => {
  if (response && response.success) {
    console.log('Bonus assigned:', response.data.bonus);
  }
});
```

### Get Department Bonus Summary

```javascript
// Example: Get bonus summary for all employees in a department
const getDepartmentBonusSummary = async (departmentId, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      department: departmentId,
      startDate,
      endDate,
      orderBy: 'totalAmount',
      order: 'desc'
    });
    
    const data = await apiRequest(`/api/bonus/summary/by-employee?${params.toString()}`);
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "summary": [
    //       {
    //         "employeeId": 456,
    //         "employeeName": "Jane Employee",
    //         "departmentId": 3,
    //         "departmentName": "Sales",
    //         "totalAmount": 145000,
    //         "bonusCount": 8,
    //         "averageAmount": 18125
    //       },
    //       // More employees...
    //     ],
    //     "departmentTotals": { ... },
    //     "companyTotal": { ... }
    //   }
    // }
  } catch (error) {
    console.error('Error fetching bonus summary:', error);
    return null;
  }
};

// Example usage
const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
const today = new Date().toISOString().split('T')[0];

getDepartmentBonusSummary(3, firstDayOfYear, today).then(response => {
  if (response && response.success) {
    console.log('Department bonus summary:', response.data);
    
    // Example: Using the data to create a table or chart
    const employees = response.data.summary.map(item => ({
      name: item.employeeName,
      amount: item.totalAmount,
      count: item.bonusCount,
      average: item.averageAmount
    }));
    
    // renderBonusTable(employees);
  }
});
```

## Document Templates

### Get All Templates

```javascript
// Example: Get all document templates
const getDocumentTemplates = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add any filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    
    let url = '/api/document-templates';
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const data = await apiRequest(url);
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "templates": [
    //       {
    //         "id": 1,
    //         "title": "Basic Contract",
    //         "type": "contract",
    //         "description": "Basic contract template with standard clauses",
    //         "is_active": true,
    //         "version": 1,
    //         "created_at": "2025-04-01T10:00:00.000Z",
    //         "department_id": 1,
    //         "format": "html",
    //         "created_by_name": "John Manager",
    //         "department_name": "Legal"
    //       },
    //       // More templates...
    //     ],
    //     "pagination": {
    //       "page": 1,
    //       "limit": 10,
    //       "total": 5,
    //       "total_pages": 1
    //     }
    //   }
    // }
  } catch (error) {
    console.error('Error fetching document templates:', error);
    return null;
  }
};

// Example usage
getDocumentTemplates({
  type: 'contract',
  is_active: true,
  department_id: 1
}).then(response => {
  if (response && response.success) {
    console.log('Document templates:', response.data.templates);
    
    // Example: Render templates in a dropdown
    const options = response.data.templates.map(template => ({
      value: template.id,
      label: template.title
    }));
    
    // renderTemplateDropdown(options);
  }
});
```

### Get Template with Fields

```javascript
// Example: Get a template with its fields
const getTemplateWithFields = async (templateId) => {
  try {
    const data = await apiRequest(`/api/document-templates/${templateId}`);
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "id": 1,
    //     "title": "Basic Contract",
    //     "type": "contract",
    //     "content": "<h1>CONTRACT № {{CONTRACT_NUMBER}}</h1>\n<p>{{CONTRACT_DATE}}</p>...",
    //     "description": "Basic contract template with standard clauses",
    //     "is_active": true,
    //     "version": 1,
    //     "fields": [
    //       {
    //         "id": 1,
    //         "field_key": "CONTRACT_NUMBER",
    //         "field_name": "Contract Number",
    //         "field_type": "text",
    //         "is_required": true
    //       },
    //       // More fields...
    //     ]
    //   }
    // }
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
};

// Example usage
getTemplateWithFields(1).then(response => {
  if (response && response.success) {
    const template = response.data;
    console.log('Template:', template.title);
    console.log('Fields:', template.fields);
    
    // Example: Generate form fields based on template
    const formFields = template.fields.map(field => ({
      id: field.field_key,
      label: field.field_name,
      type: field.field_type,
      required: field.is_required,
      defaultValue: field.default_value || ''
    }));
    
    // renderDynamicForm(formFields);
  }
});
```

### Create a New Template

```javascript
// Example: Create a new document template
const createTemplate = async (templateData) => {
  try {
    const data = await apiRequest('/api/document-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    
    return data;
  } catch (error) {
    console.error('Error creating template:', error);
    return null;
  }
};

// Example usage
const newTemplate = {
  title: "Sales Agreement",
  type: "contract",
  content: "<h1>SALES AGREEMENT № {{CONTRACT_NUMBER}}</h1>\n<p>Date: {{CONTRACT_DATE}}</p>\n<p>Between {{COMPANY_NAME}} and {{CLIENT_NAME}}</p>\n...",
  description: "Standard sales agreement for all clients",
  is_active: true,
  department_id: 3,
  format: "html",
  fields: [
    {
      field_key: "CONTRACT_NUMBER",
      field_name: "Contract Number",
      field_description: "Unique contract reference number",
      field_type: "text",
      is_required: true
    },
    {
      field_key: "CONTRACT_DATE",
      field_name: "Contract Date",
      field_description: "Date when contract is signed",
      field_type: "date",
      is_required: true
    },
    {
      field_key: "COMPANY_NAME",
      field_name: "Company Name",
      field_description: "Your company name",
      field_type: "text",
      is_required: true
    },
    {
      field_key: "CLIENT_NAME",
      field_name: "Client Name",
      field_description: "Client's company name",
      field_type: "text",
      is_required: true
    }
  ]
};

createTemplate(newTemplate).then(response => {
  if (response && response.success) {
    console.log('Template created with ID:', response.data.id);
  }
});
```

### Generate Document from Template

```javascript
// Example: Generate a document from a template
const generateDocument = async (templateId, documentData) => {
  try {
    const data = await apiRequest(`/api/document-templates/${templateId}/generate`, {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
    
    return data;
  } catch (error) {
    console.error('Error generating document:', error);
    return null;
  }
};

// Example usage
const documentData = {
  data: {
    CONTRACT_NUMBER: "SA-2025-001",
    CONTRACT_DATE: "April 10, 2025",
    COMPANY_NAME: "BIZ360 Corp",
    CLIENT_NAME: "Acme Inc.",
    PRODUCT_DESCRIPTION: "Software licensing and maintenance",
    TOTAL_AMOUNT: "25,000",
    CURRENCY: "USD",
    PAYMENT_TERMS: "Net 30"
  },
  document_name: "Sales Agreement - Acme Inc.",
  save_to_drive: true,
  related_entity_type: "customer",
  related_entity_id: 456
};

generateDocument(1, documentData).then(response => {
  if (response && response.success) {
    console.log('Document generated:', response.data);
    
    // Open the generated document in a new tab
    if (response.data.fileUrl) {
      window.open(response.data.fileUrl, '_blank');
    }
    
    // Or display the content in the UI
    // displayGeneratedDocument(response.data.content);
  }
});
```

### Get Generated Documents

```javascript
// Example: Get list of generated documents
const getGeneratedDocuments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add any filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    
    let url = '/api/document-templates/generated';
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const data = await apiRequest(url);
    return data;
  } catch (error) {
    console.error('Error fetching generated documents:', error);
    return null;
  }
};

// Example usage
getGeneratedDocuments({
  related_entity_type: 'customer',
  related_entity_id: 456
}).then(response => {
  if (response && response.success) {
    console.log('Generated documents:', response.data.documents);
    
    // Example: Render documents in a table
    const documents = response.data.documents.map(doc => ({
      id: doc.id,
      name: doc.document_name,
      template: doc.template_title,
      date: new Date(doc.created_at).toLocaleDateString(),
      url: doc.file_url
    }));
    
    // renderDocumentsTable(documents);
  }
});
```

### Export Document to PDF

```javascript
// Example: Export a generated document to PDF
const exportToPdf = async (documentId) => {
  try {
    const data = await apiRequest(`/api/document-templates/generated/${documentId}/export-pdf`, {
      method: 'POST'
    });
    
    return data;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return null;
  }
};

// Example usage
exportToPdf(5).then(response => {
  if (response && response.success) {
    console.log('Document exported to PDF:', response.data);
    
    // Open the PDF in a new tab
    if (response.data.fileUrl) {
      window.open(response.data.fileUrl, '_blank');
    }
  }
});
```

### Document Template Form Generator

```javascript
// Example: Dynamic form generator for document templates
class DocumentTemplateForm {
  constructor(templateId, containerId, onSubmit) {
    this.templateId = templateId;
    this.container = document.getElementById(containerId);
    this.onSubmit = onSubmit;
    this.template = null;
    this.formValues = {};
  }
  
  async initialize() {
    try {
      // Load template with fields
      const response = await apiRequest(`/api/document-templates/${this.templateId}`);
      
      if (response && response.success) {
        this.template = response.data;
        this.renderForm();
        this.setupEventListeners();
      } else {
        throw new Error('Failed to load template');
      }
    } catch (error) {
      console.error('Error initializing form:', error);
      this.container.innerHTML = '<div class="error">Error loading template</div>';
    }
  }
  
  renderForm() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create form
    const form = document.createElement('form');
    form.id = `template-form-${this.templateId}`;
    form.className = 'template-form';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = this.template.title;
    form.appendChild(title);
    
    // Add fields
    if (this.template.fields && this.template.fields.length > 0) {
      const fieldsContainer = document.createElement('div');
      fieldsContainer.className = 'form-fields';
      
      this.template.fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'form-field';
        
        // Create label
        const label = document.createElement('label');
        label.htmlFor = field.field_key;
        label.textContent = field.field_name;
        if (field.is_required) {
          label.className = 'required';
        }
        
        // Create input based on field type
        let input;
        switch (field.field_type) {
          case 'textarea':
            input = document.createElement('textarea');
            input.rows = 4;
            break;
          case 'date':
            input = document.createElement('input');
            input.type = 'date';
            break;
          case 'number':
            input = document.createElement('input');
            input.type = 'number';
            break;
          default:
            input = document.createElement('input');
            input.type = 'text';
        }
        
        // Set common attributes
        input.id = field.field_key;
        input.name = field.field_key;
        input.required = field.is_required;
        
        if (field.default_value) {
          input.value = field.default_value;
          this.formValues[field.field_key] = field.default_value;
        }
        
        // Add description/help text if available
        let helpText = null;
        if (field.field_description) {
          helpText = document.createElement('small');
          helpText.className = 'help-text';
          helpText.textContent = field.field_description;
        }
        
        // Append elements to field container
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(input);
        if (helpText) {
          fieldContainer.appendChild(helpText);
        }
        
        // Add field to form
        fieldsContainer.appendChild(fieldContainer);
      });
      
      form.appendChild(fieldsContainer);
    }
    
    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Generate Document';
    submitBtn.className = 'generate-btn';
    form.appendChild(submitBtn);
    
    // Add form to container
    this.container.appendChild(form);
  }
  
  setupEventListeners() {
    const form = document.getElementById(`template-form-${this.templateId}`);
    
    // Add input listeners
    this.template.fields.forEach(field => {
      const input = document.getElementById(field.field_key);
      input.addEventListener('change', (e) => {
        this.formValues[field.field_key] = e.target.value;
      });
    });
    
    // Add submit listener
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Call the onSubmit callback with form values
      if (typeof this.onSubmit === 'function') {
        this.onSubmit(this.templateId, {
          data: this.formValues,
          document_name: `${this.template.title} - ${new Date().toLocaleDateString()}`,
          save_to_drive: true
        });
      }
    });
  }
}

// Example usage
const documentForm = new DocumentTemplateForm(1, 'template-form-container', async (templateId, data) => {
  try {
    const response = await generateDocument(templateId, data);
    
    if (response && response.success) {
      alert('Document generated successfully!');
      
      // Open the document
      if (response.data.fileUrl) {
        window.open(response.data.fileUrl, '_blank');
      }
    } else {
      alert('Error generating document');
    }
  } catch (error) {
    console.error('Error in form submission:', error);
    alert('Error generating document');
  }
});

documentForm.initialize();
```

## Working with Other Modules

### Integrating Tasks with Calendar

```javascript
// Example: Create a calendar event for a task
const createTaskEvent = async (taskId, taskTitle, startTime, endTime) => {
  try {
    const eventData = {
      title: `Task: ${taskTitle}`,
      description: `Work session for task #${taskId}`,
      start_time: startTime,
      end_time: endTime,
      type: "task_work",
      related_to: "task",
      related_id: taskId,
      attendees: [] // Add yourself or others as needed
    };
    
    const data = await apiRequest('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    
    return data;
  } catch (error) {
    console.error('Error creating task event:', error);
    return null;
  }
};

// Example usage
getTaskWithComments(1).then(response => {
  if (response && response.success) {
    const task = response.data.task;
    
    // Schedule a 2-hour work session for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);
    
    createTaskEvent(
      task.id,
      task.title,
      tomorrow.toISOString(),
      tomorrowEnd.toISOString()
    ).then(eventResponse => {
      if (eventResponse && eventResponse.success) {
        console.log('Task event created:', eventResponse.data.event);
      }
    });
  }
});
```

### Checking Bonus Rules for Orders

```javascript
// Example: Get bonus rules for the current user
const getBonusRules = async () => {
  try {
    const data = await apiRequest('/api/orders/bonus-rules');
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "rules": [
    //       {
    //         "id": 1,
    //         "name": "Sales Commission - Standard",
    //         "calculation_type": "percentage",
    //         "base_percentage": 5,
    //         "conditions": [
    //           {
    //             "field": "margin_percent",
    //             "operator": ">",
    //             "value": 20,
    //             "result": "percentage = 7"
    //           },
    //           // More conditions...
    //         ]
    //       },
    //       // More rules...
    //     ]
    //   }
    // }
  } catch (error) {
    console.error('Error fetching bonus rules:', error);
    return null;
  }
};
```

### Calculate Potential Bonus for Order Items

```javascript
// Example: Calculate potential bonuses for order items (during order creation)
const calculatePotentialBonuses = async (orderItems) => {
  try {
    const data = await apiRequest('/api/orders/calculate-bonuses', {
      method: 'POST',
      body: JSON.stringify({
        items: orderItems
      }),
    });
    
    return data;
    
    // Example response:
    // {
    //   "success": true,
    //   "data": {
    //     "items": [
    //       {
    //         "id": 1,
    //         "product_id": 101,
    //         "base_price": 1000,
    //         "actual_price": 1200,
    //         "quantity": 5,
    //         "margin_percent": 20,
    //         "total_value": 6000,
    //         "bonus_eligible": true,
    //         "potential_bonus": 300
    //       },
    //       // More items...
    //     ],
    //     "total_potential_bonus": 850
    //   }
    // }
  } catch (error) {
    console.error('Error calculating potential bonuses:', error);
    return null;
  }
};

// Example usage
const orderItems = [
  {
    product_id: 101,
    base_price: 1000,
    actual_price: 1200,
    quantity: 5
  },
  {
    product_id: 102,
    base_price: 500,
    actual_price: 700,
    quantity: 2
  }
];

calculatePotentialBonuses(orderItems).then(response => {
  if (response && response.success) {
    console.log('Potential bonuses:', response.data);
    
    // Update UI to display potential bonus
    const totalBonus = response.data.total_potential_bonus;
    // displayPotentialBonus(totalBonus);
  }
});
```

### Complete Integration Example

```javascript
// Example: Dashboard component that displays tasks, calendar, and bonus info
class DashboardComponent {
  constructor() {
    this.tasks = [];
    this.events = [];
    this.bonusStats = null;
  }
  
  async loadDashboardData(employeeId) {
    try {
      // Load data in parallel
      const [tasksResponse, eventsResponse, bonusResponse] = await Promise.all([
        this.loadTasks(),
        this.loadEvents(),
        this.loadBonusStats(employeeId)
      ]);
      
      // Process responses
      if (tasksResponse && tasksResponse.success) {
        this.tasks = tasksResponse.data.tasks;
        this.renderTasksList();
      }
      
      if (eventsResponse && eventsResponse.success) {
        this.events = eventsResponse.data.events;
        this.renderCalendar();
      }
      
      if (bonusResponse && bonusResponse.success) {
        this.bonusStats = bonusResponse.data;
        this.renderBonusWidget();
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }
  
  async loadTasks() {
    return await apiRequest('/api/tasks/my');
  }
  
  async loadEvents() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return await apiRequest(`/api/calendar/my?startFrom=${today.toISOString().split('T')[0]}&startTo=${nextWeek.toISOString().split('T')[0]}`);
  }
  
  async loadBonusStats(employeeId) {
    return await apiRequest(`/api/bonus/employee/${employeeId}/statistics?periodType=month&limit=3`);
  }
  
  renderTasksList() {
    // Implementation for rendering tasks list
    console.log(`Rendering ${this.tasks.length} tasks`);
  }
  
  renderCalendar() {
    // Implementation for rendering calendar events
    console.log(`Rendering ${this.events.length} calendar events`);
  }
  
  renderBonusWidget() {
    // Implementation for rendering bonus widget
    console.log('Rendering bonus statistics widget');
    
    if (this.bonusStats) {
      console.log(`Total bonuses: ${this.bonusStats.totalBonuses}`);
      console.log(`Average bonus: ${this.bonusStats.averageBonus}`);
    }
  }
}

// Example usage
const dashboard = new DashboardComponent();
dashboard.loadDashboardData(456);
```