# **Expanse Backend Documentation**

## **Table of Contents**

1. [Introduction](#bookmark=id.gs1gbqmz0lqr)

2. [Authentication](#bookmark=id.w3gxlnhnmawp)

3. [User Roles and Permissions](#bookmark=id.ck33wcb36j9v)

4. [Core Modules](#bookmark=id.8a1r9w13gtyt)

5. [Task Management Module](#bookmark=id.1sbkzzpwu9in)

6. [Calendar Module](#bookmark=id.81m2bhkmemid)

7. [Bonus System Module](#bookmark=id.uxmnv1rup4te)

8. [Document Templates Module](#bookmark=id.1fwu81nl4x81)

9. [API Reference](#bookmark=id.8xo7xttfdb82)

10. [Common Response Formats](#bookmark=id.pg3h4cdyhqg)

11. [Error Handling](#bookmark=id.4ga3g7slqlb3)

## **Introduction**

Expanse is a comprehensive business management system that provides tools for managing employees, customers, suppliers, orders, documents, and various business processes. This documentation covers the backend API and functionality, intended for both end-users and frontend developers.

The system is built using: \- Node.js with Express framework \- MySQL database with direct queries through mysql2/promise \- JWT-based authentication \- Role-based access control with granular permissions

## **Authentication**

### **Registration**

POST /api/auth/register

**Request Body:**

{  
  "email": "user@example.com",  
  "password": "SecurePassword123",  
  "name": "John Doe",  
  "company\_name": "Example Corp", **//** **Only** **for** **company** **owners**  
  "phone": "+77001234567",  
  "role": "owner" **//** "owner" **or** "employee"  
}

**Response:**

{  
  "success": **true**,  
  "message": "Registration successful. Please verify your email.",  
  "data": {  
    "userId": 123,  
    "email": "user@example.com",  
    "verificationToken": "token123"  
  }  
}

### **Login**

POST /api/auth/login

**Request Body:**

{  
  "email": "user@example.com",  
  "password": "SecurePassword123"  
}

**Response:**

{  
  "success": **true**,  
  "data": {  
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  
    "user": {  
      "id": 123,  
      "name": "John Doe",  
      "email": "user@example.com",  
      "role": "admin",  
      "company\_id": 45,  
      "department\_id": 2  
    }  
  }  
}

### **Refresh Token**

POST /api/auth/refresh-token

**Request Body:**

{  
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  
}

**Response:**

{  
  "success": **true**,  
  "data": {  
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  
  }  
}

### **Authentication Headers**

For all protected endpoints, include the JWT token in the Authorization header:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## **User Roles and Permissions**

### **Role Hierarchy**

1. **Company Level Roles**

   * **Owner**: Highest access level with all permissions

   * **Admin**: Company-wide administration privileges

2. **Department Level Roles**

   * **Head**: Department manager with department-wide permissions

   * **Manager**: Limited management capabilities within a department

   * **Employee**: Basic access to department resources

### **Permission Structure**

Permissions are based on action-resource pairs in the format action:resource:

* Common actions: read, create, update, delete, approve

* Resources include: employees, customers, orders, documents, products, etc.

Examples: \- read:employees \- Can view employee information \- create:orders \- Can create new orders \- approve:documents \- Can approve documents

### **Department-Specific Access**

Users have access to resources within their own department by default. Additional permissions are needed for cross-department access.

## **Core Modules**

Expanse includes the following core modules:

1. **Employee Management**: Create and manage employees, departments, and roles

2. **Customer Management**: Track customer information and interactions

3. **Supplier Management**: Manage supplier information and catalogs

4. **Product Management**: Maintain product catalogs with pricing

5. **Order Management**: Process customer orders and track fulfillment

6. **Document Management**: Create and manage business documents

7. **Document Templates**: Create, manage, and generate documents from templates

8. **Invoice Management**: Generate and track invoices and payments

9. **Task Management**: Assign, track, and complete tasks

10. **Calendar**: Schedule events and appointments

11. **Bonus System**: Calculate and distribute employee bonuses

## **Task Management Module**

The Task Management module allows users to create, assign, track, and complete tasks within the organization.

### **Core Features**

1. **Task Creation and Assignment**

   * Create tasks with descriptive titles and details

   * Assign tasks to specific employees

   * Set priority levels (Low, Medium, High, Critical)

   * Set due dates and deadlines

2. **Task Tracking and Status Management**

   * Track task progress through multiple statuses (Open, In Progress, Done)

   * Add comments for collaboration

   * Track time spent on tasks

3. **Task Categorization and Filtering**

   * Categorize tasks by type

   * Filter tasks by multiple criteria (assignee, status, priority, etc.)

   * Search for specific tasks

4. **Task Metrics and Reporting**

   * Track completion rates and times

   * Measure employee performance on tasks

   * Generate task status reports

### **Database Structure**

The Task Management module uses the following database tables:

1. **tasks**

   * id \- Unique identifier

   * title \- Task title

   * description \- Detailed task description

   * status \- Current task status (open, in\_progress, done)

   * priority \- Task priority (low, medium, high, critical)

   * due\_date \- Task deadline

   * created\_by \- User who created the task

   * assigned\_to \- User assigned to complete the task

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

   * completed\_at \- Completion timestamp

   * category \- Task category

   * related\_to \- Related entity type (customer, order, etc.)

   * related\_id \- ID of related entity

2. **task\_comments**

   * id \- Unique identifier

   * task\_id \- Associated task

   * user\_id \- Comment author

   * comment \- Comment text

   * created\_at \- Creation timestamp

3. **task\_metrics**

   * id \- Unique identifier

   * task\_id \- Associated task

   * completion\_time \- Time taken to complete

   * quality\_score \- Quality rating of completion

   * impact\_on\_kpi \- Effect on key performance indicators

### **API Endpoints**

#### *Get All Tasks*

GET /api/tasks

**Query Parameters:** \- status \- Filter by status (open, in\_progress, done) \- priority \- Filter by priority (low, medium, high, critical) \- assignedTo \- Filter by assigned user ID \- createdBy \- Filter by creator user ID \- dueDate \- Filter by due date \- search \- Search in title and description \- limit \- Number of results per page (default: 20\) \- offset \- Page offset for pagination

**Response:**

{  
  "success": **true**,  
  "data": {  
    "tasks": \[  
      {  
        "id": 1,  
        "title": "Complete project proposal",  
        "description": "Draft a proposal for the new client project",  
        "status": "in\_progress",  
        "priority": "high",  
        "due\_date": "2025-04-15T00:00:00.000Z",  
        "created\_by": 123,  
        "assigned\_to": 456,  
        "created\_at": "2025-04-01T10:30:00.000Z",  
        "updated\_at": "2025-04-02T14:15:00.000Z",  
        "completed\_at": **null**,  
        "category": "proposal",  
        "creator": {  
          "id": 123,  
          "name": "John Manager"  
        },  
        "assignee": {  
          "id": 456,  
          "name": "Jane Employee"  
        }  
      },  
      **//** **More** **tasks...**  
    \],  
    "total": 45,  
    "page": 1,  
    "limit": 20  
  }  
}

#### *Get User’s Tasks*

GET /api/tasks/my

Returns only tasks assigned to the authenticated user, with the same parameters and response format as the Get All Tasks endpoint.

#### *Get Task by ID*

GET /api/tasks/:id

**Response:**

{  
  "success": **true**,  
  "data": {  
    "task": {  
      "id": 1,  
      "title": "Complete project proposal",  
      "description": "Draft a proposal for the new client project",  
      "status": "in\_progress",  
      "priority": "high",  
      "due\_date": "2025-04-15T00:00:00.000Z",  
      "created\_by": 123,  
      "assigned\_to": 456,  
      "created\_at": "2025-04-01T10:30:00.000Z",  
      "updated\_at": "2025-04-02T14:15:00.000Z",  
      "completed\_at": **null**,  
      "category": "proposal",  
      "creator": {  
        "id": 123,  
        "name": "John Manager"  
      },  
      "assignee": {  
        "id": 456,  
        "name": "Jane Employee"  
      },  
      "related\_to": "customer",  
      "related\_id": 789,  
      "related\_entity": {  
        "id": 789,  
        "name": "Acme Corp"  
      },  
      "comments": \[  
        {  
          "id": 1,  
          "user\_id": 123,  
          "comment": "How is the progress on this?",  
          "created\_at": "2025-04-03T09:00:00.000Z",  
          "user": {  
            "id": 123,  
            "name": "John Manager"  
          }  
        }  
      \]  
    }  
  }  
}

#### *Create Task*

POST /api/tasks

**Request Body:**

{  
  "title": "Complete project proposal",  
  "description": "Draft a proposal for the new client project",  
  "status": "open",  
  "priority": "high",  
  "due\_date": "2025-04-15",  
  "assigned\_to": 456,  
  "category": "proposal",  
  "related\_to": "customer",  
  "related\_id": 789  
}

**Response:**

{  
  "success": **true**,  
  "message": "Task created successfully",  
  "data": {  
    "task": {  
      "id": 1,  
      "title": "Complete project proposal",  
      "description": "Draft a proposal for the new client project",  
      "status": "open",  
      "priority": "high",  
      "due\_date": "2025-04-15T00:00:00.000Z",  
      "created\_by": 123,  
      "assigned\_to": 456,  
      "created\_at": "2025-04-01T10:30:00.000Z",  
      "updated\_at": "2025-04-01T10:30:00.000Z",  
      "completed\_at": **null**,  
      "category": "proposal",  
      "related\_to": "customer",  
      "related\_id": 789  
    }  
  }  
}

#### *Update Task*

PUT /api/tasks/:id

**Request Body:** Same format as Create Task

**Response:**

{  
  "success": **true**,  
  "message": "Task updated successfully",  
  "data": {  
    "task": {  
      **//** **Updated** **task** **details**  
    }  
  }  
}

#### *Update Task Status*

PATCH /api/tasks/:id/status

**Request Body:**

{  
  "status": "done"  
}

**Response:**

{  
  "success": **true**,  
  "message": "Task status updated successfully",  
  "data": {  
    "task": {  
      **//** **Updated** **task** **details** **with** **new** **status**  
      "status": "done",  
      "completed\_at": "2025-04-10T15:45:00.000Z"  
    }  
  }  
}

#### *Delete Task*

DELETE /api/tasks/:id

**Response:**

{  
  "success": **true**,  
  "message": "Task deleted successfully"  
}

#### *Add Comment to Task*

POST /api/tasks/:taskId/comments

**Request Body:**

{  
  "comment": "I've started working on this task. Will update tomorrow."  
}

**Response:**

{  
  "success": **true**,  
  "message": "Comment added successfully",  
  "data": {  
    "comment": {  
      "id": 2,  
      "task\_id": 1,  
      "user\_id": 456,  
      "comment": "I've started working on this task. Will update tomorrow.",  
      "created\_at": "2025-04-05T16:20:00.000Z",  
      "user": {  
        "id": 456,  
        "name": "Jane Employee"  
      }  
    }  
  }  
}

## **Calendar Module**

The Calendar module helps users schedule and manage events, meetings, and appointments.

### **Core Features**

1. **Event Creation and Management**

   * Create events with title, description, start/end times

   * Set event types (meeting, call, task, etc.)

   * Define event locations

   * Assign colors for visual categorization

2. **Attendee Management**

   * Invite multiple attendees to events

   * Track acceptance status (pending, accepted, declined)

   * Notify attendees of event changes

3. **Recurring Events**

   * Create recurring event patterns

   * Manage exceptions to recurring patterns

4. **Integration with Other Modules**

   * Link events to tasks

   * Link events to customers or orders

   * Track event-related activities

### **Database Structure**

The Calendar module uses the following database tables:

1. **calendar\_events**

   * id \- Unique identifier

   * title \- Event title

   * description \- Event description

   * start\_time \- Event start time

   * end\_time \- Event end time

   * created\_by \- User who created the event

   * location \- Physical or virtual location

   * status \- Event status (planned, active, completed, cancelled)

   * priority \- Event priority

   * type \- Event type (meeting, call, appointment, etc.)

   * is\_all\_day \- Flag for all-day events

   * color \- Display color for visual categorization

   * recurring\_pattern \- JSON object defining recurrence

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

   * related\_to \- Related entity type (customer, task, etc.)

   * related\_id \- ID of related entity

2. **calendar\_event\_attendees**

   * id \- Unique identifier

   * event\_id \- Associated event

   * user\_id \- Attendee user ID

   * status \- Attendance status (pending, accepted, declined, maybe)

   * notification\_sent \- Flag indicating notification status

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

### **API Endpoints**

#### *Get All Events*

GET /api/calendar

**Query Parameters:** \- status \- Filter by status \- type \- Filter by event type \- employeeId \- Filter by attendee \- startFrom \- Filter by start date (minimum) \- startTo \- Filter by start date (maximum) \- search \- Search in title and description \- limit \- Number of results per page (default: 20\) \- offset \- Page offset for pagination

**Response:**

{  
  "success": **true**,  
  "data": {  
    "events": \[  
      {  
        "id": 1,  
        "title": "Weekly Team Meeting",  
        "description": "Regular team sync-up",  
        "start\_time": "2025-04-10T14:00:00.000Z",  
        "end\_time": "2025-04-10T15:00:00.000Z",  
        "created\_by": 123,  
        "location": "Conference Room A",  
        "status": "planned",  
        "priority": "medium",  
        "type": "meeting",  
        "is\_all\_day": **false**,  
        "color": "\#4287f5",  
        "recurring\_pattern": {  
          "frequency": "weekly",  
          "interval": 1,  
          "day\_of\_week": "thursday"  
        },  
        "created\_at": "2025-04-01T10:00:00.000Z",  
        "updated\_at": "2025-04-01T10:00:00.000Z",  
        "creator": {  
          "id": 123,  
          "name": "John Manager"  
        },  
        "attendees": \[  
          {  
            "id": 123,  
            "name": "John Manager",  
            "status": "accepted"  
          },  
          {  
            "id": 456,  
            "name": "Jane Employee",  
            "status": "pending"  
          }  
        \]  
      },  
      **//** **More** **events...**  
    \],  
    "total": 15,  
    "page": 1,  
    "limit": 20  
  }  
}

#### *Get User’s Events*

GET /api/calendar/my

Returns only events where the authenticated user is an attendee, with the same parameters and response format as the Get All Events endpoint.

#### *Get Event by ID*

GET /api/calendar/:id

**Response:**

{  
  "success": **true**,  
  "data": {  
    "event": {  
      "id": 1,  
      "title": "Weekly Team Meeting",  
      "description": "Regular team sync-up",  
      "start\_time": "2025-04-10T14:00:00.000Z",  
      "end\_time": "2025-04-10T15:00:00.000Z",  
      "created\_by": 123,  
      "location": "Conference Room A",  
      "status": "planned",  
      "priority": "medium",  
      "type": "meeting",  
      "is\_all\_day": **false**,  
      "color": "\#4287f5",  
      "recurring\_pattern": {  
        "frequency": "weekly",  
        "interval": 1,  
        "day\_of\_week": "thursday"  
      },  
      "created\_at": "2025-04-01T10:00:00.000Z",  
      "updated\_at": "2025-04-01T10:00:00.000Z",  
      "related\_to": "task",  
      "related\_id": 5,  
      "related\_entity": {  
        "id": 5,  
        "title": "Prepare presentation for client"  
      },  
      "creator": {  
        "id": 123,  
        "name": "John Manager"  
      },  
      "attendees": \[  
        {  
          "id": 456,  
          "user\_id": 123,  
          "event\_id": 1,  
          "status": "accepted",  
          "notification\_sent": **true**,  
          "created\_at": "2025-04-01T10:00:00.000Z",  
          "updated\_at": "2025-04-01T10:05:00.000Z",  
          "user": {  
            "id": 123,  
            "name": "John Manager"  
          }  
        },  
        {  
          "id": 457,  
          "user\_id": 456,  
          "event\_id": 1,  
          "status": "pending",  
          "notification\_sent": **true**,  
          "created\_at": "2025-04-01T10:00:00.000Z",  
          "updated\_at": "2025-04-01T10:00:00.000Z",  
          "user": {  
            "id": 456,  
            "name": "Jane Employee"  
          }  
        }  
      \]  
    }  
  }  
}

#### *Create Event*

POST /api/calendar

**Request Body:**

{  
  "title": "Client Presentation",  
  "description": "Present Q1 results to client",  
  "start\_time": "2025-04-15T10:00:00",  
  "end\_time": "2025-04-15T11:30:00",  
  "location": "Client Office",  
  "status": "planned",  
  "priority": "high",  
  "type": "meeting",  
  "is\_all\_day": **false**,  
  "color": "\#ff7700",  
  "related\_to": "customer",  
  "related\_id": 789,  
  "attendees": \[123, 456, 789\]  
}

**Response:**

{  
  "success": **true**,  
  "message": "Event created successfully",  
  "data": {  
    "event": {  
      "id": 2,  
      "title": "Client Presentation",  
      "description": "Present Q1 results to client",  
      "start\_time": "2025-04-15T10:00:00.000Z",  
      "end\_time": "2025-04-15T11:30:00.000Z",  
      "created\_by": 123,  
      "location": "Client Office",  
      "status": "planned",  
      "priority": "high",  
      "type": "meeting",  
      "is\_all\_day": **false**,  
      "color": "\#ff7700",  
      "created\_at": "2025-04-05T14:30:00.000Z",  
      "updated\_at": "2025-04-05T14:30:00.000Z",  
      "related\_to": "customer",  
      "related\_id": 789,  
      "attendees": \[  
        {  
          "id": 458,  
          "user\_id": 123,  
          "event\_id": 2,  
          "status": "accepted",  
          "user": {  
            "id": 123,  
            "name": "John Manager"  
          }  
        },  
        {  
          "id": 459,  
          "user\_id": 456,  
          "event\_id": 2,  
          "status": "pending",  
          "user": {  
            "id": 456,  
            "name": "Jane Employee"  
          }  
        },  
        {  
          "id": 460,  
          "user\_id": 789,  
          "event\_id": 2,  
          "status": "pending",  
          "user": {  
            "id": 789,  
            "name": "Mark Sales"  
          }  
        }  
      \]  
    }  
  }  
}

#### *Update Event*

PUT /api/calendar/:id

**Request Body:** Same format as Create Event

**Response:**

{  
  "success": **true**,  
  "message": "Event updated successfully",  
  "data": {  
    "event": {  
      **//** **Updated** **event** **details**  
    }  
  }  
}

#### *Delete Event*

DELETE /api/calendar/:id

**Response:**

{  
  "success": **true**,  
  "message": "Event deleted successfully"  
}

#### *Update Attendee Status*

PATCH /api/calendar/:id/status

**Request Body:**

{  
  "status": "accepted" **//** "pending", "accepted", "declined", "maybe"  
}

**Response:**

{  
  "success": **true**,  
  "message": "Event status updated successfully",  
  "data": {  
    "attendee": {  
      "id": 459,  
      "user\_id": 456,  
      "event\_id": 2,  
      "status": "accepted",  
      "notification\_sent": **true**,  
      "created\_at": "2025-04-05T14:30:00.000Z",  
      "updated\_at": "2025-04-06T09:15:00.000Z"  
    }  
  }  
}

#### *Get Task Events*

GET /api/calendar/task/:taskId

**Response:**

{  
  "success": **true**,  
  "data": {  
    "events": \[  
      **//** **List** **of** **events** **related** **to** **the** **specified** **task**  
    \],  
    "total": 3  
  }  
}

## **Bonus System Module**

The Bonus System module automates the calculation and distribution of bonuses to employees based on predefined rules and performance metrics.

### **Core Features**

1. **Bonus Scheme Management**

   * Create and manage bonus calculation schemes

   * Define calculation methods (fixed, percentage, formula-based)

   * Set thresholds and caps for bonus amounts

   * Create department-specific bonus rules

2. **Automatic Bonus Calculation**

   * Calculate bonuses based on order values and margins

   * Apply bonus rules based on employee performance

   * Generate potential bonus estimates for in-progress deals

3. **Bonus Approval Workflow**

   * Request bonus approval from managers

   * Track bonus status (pending, approved, paid, rejected)

   * Add notes and justifications

4. **Bonus Reporting**

   * View individual employee bonus history

   * Generate department-level bonus reports

   * Analyze bonus distribution trends

### **Database Structure**

The Bonus System module uses the following database tables:

1. **bonus\_schemes**

   * id \- Unique identifier

   * name \- Scheme name

   * description \- Detailed description

   * calculation\_type \- Method of calculation (fixed, percentage, custom\_formula)

   * base\_amount \- Fixed amount for fixed type

   * percentage \- Percentage value for percentage type

   * min\_threshold \- Minimum qualifying value

   * max\_cap \- Maximum bonus cap

   * custom\_formula \- Formula definition for custom calculations

   * applies\_to \- Entity type this scheme applies to (order, sales, performance)

   * department \- Target department ID (null for all departments)

   * active \- Status flag

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

2. **bonus\_scheme\_rules**

   * id \- Unique identifier

   * scheme\_id \- Associated bonus scheme

   * condition\_field \- Field to evaluate (margin\_percent, total\_value, etc.)

   * condition\_operator \- Comparison operator (\>, \<, \=, etc.)

   * condition\_value \- Value to compare against

   * bonus\_type \- Result type (fixed, percentage, multiplier)

   * bonus\_value \- Result value

   * priority \- Rule application priority

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

3. **employee\_bonuses**

   * id \- Unique identifier

   * employee\_id \- Associated employee

   * scheme\_id \- Associated bonus scheme (optional)

   * amount \- Bonus amount

   * description \- Bonus description

   * related\_to \- Related entity type

   * related\_id \- ID of related entity

   * calculation\_details \- JSON with calculation details

   * status \- Bonus status (pending, approved, paid, rejected)

   * notes \- Additional notes

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

   * approved\_by \- User who approved the bonus

   * approved\_at \- Approval timestamp

   * paid\_at \- Payment timestamp

### **API Endpoints**

#### *Get All Bonus Schemes*

GET /api/bonus/schemes

**Query Parameters:** \- active \- Filter by active status (true/false) \- calculationType \- Filter by calculation type \- appliesTo \- Filter by entity type \- department \- Filter by department ID \- search \- Search in name and description \- orderBy \- Field to sort by \- order \- Sort order (asc/desc) \- limit \- Number of results per page \- offset \- Page offset for pagination

**Response:**

{  
  "success": **true**,  
  "data": {  
    "schemes": \[  
      {  
        "id": 1,  
        "name": "Sales Commission \- Standard",  
        "description": "Standard commission for all sales staff",  
        "calculation\_type": "percentage",  
        "base\_amount": **null**,  
        "percentage": 5,  
        "min\_threshold": 1000,  
        "max\_cap": 10000,  
        "custom\_formula": **null**,  
        "applies\_to": "order",  
        "department": 3,  
        "active": **true**,  
        "created\_at": "2025-01-01T00:00:00.000Z",  
        "updated\_at": "2025-01-01T00:00:00.000Z",  
        "rules": \[  
          {  
            "id": 1,  
            "scheme\_id": 1,  
            "condition\_field": "margin\_percent",  
            "condition\_operator": "\>",  
            "condition\_value": 20,  
            "bonus\_type": "percentage",  
            "bonus\_value": 7,  
            "priority": 1  
          },  
          {  
            "id": 2,  
            "scheme\_id": 1,  
            "condition\_field": "total\_value",  
            "condition\_operator": "\>",  
            "condition\_value": 50000,  
            "bonus\_type": "multiplier",  
            "bonus\_value": 1.5,  
            "priority": 2  
          }  
        \]  
      },  
      **//** **More** **schemes...**  
    \],  
    "total": 5,  
    "page": 1,  
    "limit": 20  
  }  
}

#### *Get Bonus Scheme by ID*

GET /api/bonus/schemes/:id

**Response:**

{  
  "success": **true**,  
  "data": {  
    "scheme": {  
      "id": 1,  
      "name": "Sales Commission \- Standard",  
      "description": "Standard commission for all sales staff",  
      "calculation\_type": "percentage",  
      "base\_amount": **null**,  
      "percentage": 5,  
      "min\_threshold": 1000,  
      "max\_cap": 10000,  
      "custom\_formula": **null**,  
      "applies\_to": "order",  
      "department": 3,  
      "active": **true**,  
      "created\_at": "2025-01-01T00:00:00.000Z",  
      "updated\_at": "2025-01-01T00:00:00.000Z",  
      "rules": \[  
        {  
          "id": 1,  
          "scheme\_id": 1,  
          "condition\_field": "margin\_percent",  
          "condition\_operator": "\>",  
          "condition\_value": 20,  
          "bonus\_type": "percentage",  
          "bonus\_value": 7,  
          "priority": 1  
        },  
        {  
          "id": 2,  
          "scheme\_id": 1,  
          "condition\_field": "total\_value",  
          "condition\_operator": "\>",  
          "condition\_value": 50000,  
          "bonus\_type": "multiplier",  
          "bonus\_value": 1.5,  
          "priority": 2  
        }  
      \],  
      "department\_name": "Sales"  
    }  
  }  
}

#### *Create Bonus Scheme*

POST /api/bonus/schemes

**Request Body:**

{  
  "name": "High-Value Deal Bonus",  
  "description": "Special bonus for large deals",  
  "calculation\_type": "percentage",  
  "percentage": 10,  
  "min\_threshold": 100000,  
  "max\_cap": 25000,  
  "applies\_to": "order",  
  "department": 3,  
  "active": **true**,  
  "rules": \[  
    {  
      "condition\_field": "margin\_percent",  
      "condition\_operator": "\>",  
      "condition\_value": 30,  
      "bonus\_type": "multiplier",  
      "bonus\_value": 1.5,  
      "priority": 1  
    }  
  \]  
}

**Response:**

{  
  "success": **true**,  
  "message": "Bonus scheme created successfully",  
  "data": {  
    "scheme": {  
      "id": 3,  
      "name": "High-Value Deal Bonus",  
      "description": "Special bonus for large deals",  
      "calculation\_type": "percentage",  
      "base\_amount": **null**,  
      "percentage": 10,  
      "min\_threshold": 100000,  
      "max\_cap": 25000,  
      "custom\_formula": **null**,  
      "applies\_to": "order",  
      "department": 3,  
      "active": **true**,  
      "created\_at": "2025-04-05T16:30:00.000Z",  
      "updated\_at": "2025-04-05T16:30:00.000Z",  
      "rules": \[  
        {  
          "id": 5,  
          "scheme\_id": 3,  
          "condition\_field": "margin\_percent",  
          "condition\_operator": "\>",  
          "condition\_value": 30,  
          "bonus\_type": "multiplier",  
          "bonus\_value": 1.5,  
          "priority": 1  
        }  
      \]  
    }  
  }  
}

#### *Update Bonus Scheme*

PUT /api/bonus/schemes/:id

**Request Body:** Same format as Create Bonus Scheme

**Response:**

{  
  "success": **true**,  
  "message": "Bonus scheme updated successfully",  
  "data": {  
    "scheme": {  
      **//** **Updated** **scheme** **details**  
    }  
  }  
}

#### *Delete Bonus Scheme*

DELETE /api/bonus/schemes/:id

**Response:**

{  
  "success": **true**,  
  "message": "Bonus scheme deleted successfully"  
}

#### *Calculate Bonus for Deal*

POST /api/bonus/calculate

**Request Body:**

{  
  "orderId": 123,  
  "employeeId": 456  
}

**Response:**

{  
  "success": **true**,  
  "data": {  
    "calculation": {  
      "order": {  
        "id": 123,  
        "total\_value": 120000,  
        "margin\_percent": 35  
      },  
      "employee": {  
        "id": 456,  
        "name": "Jane Employee"  
      },  
      "applicable\_schemes": \[  
        {  
          "id": 1,  
          "name": "Sales Commission \- Standard",  
          "calculation\_type": "percentage",  
          "base\_percentage": 5,  
          "applied\_rules": \[  
            {  
              "id": 1,  
              "condition": "margin\_percent \> 20",  
              "result": "percentage \= 7"  
            },  
            {  
              "id": 2,  
              "condition": "total\_value \> 50000",  
              "result": "multiplier \= 1.5"  
            }  
          \],  
          "calculated\_percentage": 10.5,  
          "calculated\_amount": 12600  
        },  
        {  
          "id": 3,  
          "name": "High-Value Deal Bonus",  
          "calculation\_type": "percentage",  
          "base\_percentage": 10,  
          "applied\_rules": \[  
            {  
              "id": 5,  
              "condition": "margin\_percent \> 30",  
              "result": "multiplier \= 1.5"  
            }  
          \],  
          "calculated\_percentage": 15,  
          "calculated\_amount": 18000  
        }  
      \],  
      "selected\_scheme": {  
        "id": 3,  
        "name": "High-Value Deal Bonus"  
      },  
      "final\_amount": 18000,  
      "capped\_amount": 18000  
    }  
  }  
}

#### *Assign Bonus*

POST /api/bonus/assign

**Request Body:**

{  
  "employee\_id": 456,  
  "scheme\_id": 3,  
  "amount": 18000,  
  "description": "Bonus for Acme Corp deal",  
  "related\_to": "order",  
  "related\_id": 123,  
  "calculation\_details": {  
    **//** **Optional** **calculation** **details** **JSON**  
    "order\_value": 120000,  
    "margin\_percent": 35,  
    "base\_percentage": 10,  
    "multipliers": \[1.5\],  
    "final\_percentage": 15  
  },  
  "status": "pending",  
  "notes": "Outstanding performance on this high-value deal"  
}

**Response:**

{  
  "success": **true**,  
  "message": "Bonus assigned successfully",  
  "data": {  
    "bonus": {  
      "id": 5,  
      "employee\_id": 456,  
      "scheme\_id": 3,  
      "amount": 18000,  
      "description": "Bonus for Acme Corp deal",  
      "related\_to": "order",  
      "related\_id": 123,  
      "calculation\_details": {  
        "order\_value": 120000,  
        "margin\_percent": 35,  
        "base\_percentage": 10,  
        "multipliers": \[1.5\],  
        "final\_percentage": 15  
      },  
      "status": "pending",  
      "notes": "Outstanding performance on this high-value deal",  
      "created\_at": "2025-04-05T17:00:00.000Z",  
      "updated\_at": "2025-04-05T17:00:00.000Z",  
      "approved\_by": **null**,  
      "approved\_at": **null**,  
      "paid\_at": **null**  
    }  
  }  
}

#### *Auto-Assign Bonus for Deal*

POST /api/bonus/auto-assign

**Request Body:**

{  
  "orderId": 123,  
  "employeeId": 456  
}

**Response:**

{  
  "success": **true**,  
  "message": "Bonus auto-assigned successfully",  
  "data": {  
    "bonus": {  
      "id": 6,  
      "employee\_id": 456,  
      "scheme\_id": 3,  
      "amount": 18000,  
      "description": "Auto-calculated bonus for Order \#123",  
      "related\_to": "order",  
      "related\_id": 123,  
      "calculation\_details": {  
        **//** **Calculation** **details**  
      },  
      "status": "pending",  
      "notes": "Automatically calculated based on order metrics",  
      "created\_at": "2025-04-05T17:15:00.000Z",  
      "updated\_at": "2025-04-05T17:15:00.000Z"  
    },  
    "calculation": {  
      **//** **Calculation** **details** **(same** **as** **in** **Calculate** **Bonus** **response)**  
    }  
  }  
}

#### *Get All Bonuses*

GET /api/bonus

**Query Parameters:** \- status \- Filter by status \- relatedTo \- Filter by related entity type \- schemeId \- Filter by bonus scheme \- department \- Filter by department \- startDate \- Filter by creation date (min) \- endDate \- Filter by creation date (max) \- search \- Search in description \- orderBy \- Field to sort by \- order \- Sort order (asc/desc) \- limit \- Number of results per page \- offset \- Page offset for pagination

**Response:**

{  
  "success": **true**,  
  "data": {  
    "bonuses": \[  
      {  
        "id": 5,  
        "employee\_id": 456,  
        "scheme\_id": 3,  
        "amount": 18000,  
        "description": "Bonus for Acme Corp deal",  
        "related\_to": "order",  
        "related\_id": 123,  
        "status": "pending",  
        "created\_at": "2025-04-05T17:00:00.000Z",  
        "updated\_at": "2025-04-05T17:00:00.000Z",  
        "employee": {  
          "id": 456,  
          "name": "Jane Employee",  
          "department\_id": 3  
        },  
        "scheme": {  
          "id": 3,  
          "name": "High-Value Deal Bonus"  
        },  
        "related\_entity": {  
          "id": 123,  
          "name": "Acme Corp Order \#AC-2025-123"  
        }  
      },  
      **//** **More** **bonuses...**  
    \],  
    "total": 12,  
    "page": 1,  
    "limit": 20  
  }  
}

#### *Get Bonus by ID*

GET /api/bonus/:id

**Response:**

{  
  "success": **true**,  
  "data": {  
    "bonus": {  
      "id": 5,  
      "employee\_id": 456,  
      "scheme\_id": 3,  
      "amount": 18000,  
      "description": "Bonus for Acme Corp deal",  
      "related\_to": "order",  
      "related\_id": 123,  
      "calculation\_details": {  
        "order\_value": 120000,  
        "margin\_percent": 35,  
        "base\_percentage": 10,  
        "multipliers": \[1.5\],  
        "final\_percentage": 15  
      },  
      "status": "pending",  
      "notes": "Outstanding performance on this high-value deal",  
      "created\_at": "2025-04-05T17:00:00.000Z",  
      "updated\_at": "2025-04-05T17:00:00.000Z",  
      "approved\_by": **null**,  
      "approved\_at": **null**,  
      "paid\_at": **null**,  
      "employee": {  
        "id": 456,  
        "name": "Jane Employee",  
        "department\_id": 3,  
        "department\_name": "Sales"  
      },  
      "scheme": {  
        "id": 3,  
        "name": "High-Value Deal Bonus",  
        "calculation\_type": "percentage"  
      },  
      "related\_entity": {  
        "id": 123,  
        "name": "Acme Corp Order \#AC-2025-123",  
        "total\_value": 120000  
      }  
    }  
  }  
}

#### *Update Bonus Status*

PATCH /api/bonus/:id/status

**Request Body:**

{  
  "status": "approved",  
  "notes": "Approved by management"  
}

**Response:**

{  
  "success": **true**,  
  "message": "Bonus status updated successfully",  
  "data": {  
    "bonus": {  
      "id": 5,  
      "status": "approved",  
      "notes": "Approved by management",  
      "approved\_by": 123,  
      "approved\_at": "2025-04-06T09:30:00.000Z",  
      "updated\_at": "2025-04-06T09:30:00.000Z"  
      **//** **Other** **bonus** **fields...**  
    }  
  }  
}

#### *Get Employee Bonuses*

GET /api/bonus/employee/:employeeId

**Query Parameters:** Similar to Get All Bonuses

**Response:**

{  
  "success": **true**,  
  "data": {  
    "bonuses": \[  
      **//** **List** **of** **bonuses** **for** **the** **specified** **employee**  
    \],  
    "total": 8,  
    "page": 1,  
    "limit": 20  
  }  
}

#### *Get Employee Bonus Statistics*

GET /api/bonus/employee/:employeeId/statistics

**Query Parameters:** \- periodType \- Time period for statistics (month, quarter, year) \- limit \- Number of periods to return

**Response:**

{  
  "success": **true**,  
  "data": {  
    "employeeId": 456,  
    "employeeName": "Jane Employee",  
    "departmentId": 3,  
    "departmentName": "Sales",  
    "totalBonuses": 145000,  
    "averageBonus": 18125,  
    "topBonus": 25000,  
    "periodicData": \[  
      {  
        "period": "2025-04",  
        "periodName": "April 2025",  
        "totalAmount": 18000,  
        "count": 1  
      },  
      {  
        "period": "2025-03",  
        "periodName": "March 2025",  
        "totalAmount": 32000,  
        "count": 2  
      },  
      **//** **More** **periods...**  
    \]  
  }  
}

#### *Get Bonus Summary by Employee*

GET /api/bonus/summary/by-employee

**Query Parameters:** \- department \- Filter by department \- startDate \- Start date for summary period \- endDate \- End date for summary period \- search \- Search by employee name \- orderBy \- Field to sort by (default: totalAmount) \- order \- Sort order (asc/desc)

**Response:**

{  
  "success": **true**,  
  "data": {  
    "summary": \[  
      {  
        "employeeId": 456,  
        "employeeName": "Jane Employee",  
        "departmentId": 3,  
        "departmentName": "Sales",  
        "totalAmount": 145000,  
        "bonusCount": 8,  
        "averageAmount": 18125  
      },  
      {  
        "employeeId": 789,  
        "employeeName": "Mark Sales",  
        "departmentId": 3,  
        "departmentName": "Sales",  
        "totalAmount": 120000,  
        "bonusCount": 6,  
        "averageAmount": 20000  
      },  
      **//** **More** **employees...**  
    \],  
    "departmentTotals": \[  
      {  
        "departmentId": 3,  
        "departmentName": "Sales",  
        "totalAmount": 265000,  
        "employeeCount": 2,  
        "bonusCount": 14  
      },  
      **//** **More** **departments...**  
    \],  
    "companyTotal": {  
      "totalAmount": 320000,  
      "employeeCount": 5,  
      "bonusCount": 20,  
      "averagePerEmployee": 64000  
    }  
  }  
}

## **Document Templates Module**

The Document Templates module allows users to create, manage, and generate documents based on predefined templates with placeholder variables.

### **Core Features**

1. **Template Management**

   * Create and manage document templates with placeholders

   * Support for different document types (contracts, invoices, proposals, etc.)

   * Version control for templates

   * Department-specific templates

2. **Template Fields**

   * Define and manage fields for templates

   * Specify field types (text, number, date, etc.)

   * Set required fields

3. **Document Generation**

   * Generate documents by filling templates with data

   * Support for complex data structures

   * Handlebars templating engine for flexible formatting

   * Export to PDF

4. **Generated Documents Management**

   * Store generated documents

   * Link documents to related entities (customers, orders, etc.)

   * Track document history

### **Database Structure**

The Document Templates module uses the following database tables:

1. **document\_templates**

   * id \- Unique identifier

   * title \- Template title

   * type \- Document type (contract, invoice, proposal, etc.)

   * content \- Template content with placeholders

   * description \- Template description

   * is\_active \- Active status flag

   * version \- Template version

   * created\_by \- User who created the template

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

   * department\_id \- Department ID (null for all departments)

   * format \- Template format (html, markdown, etc.)

   * file\_id \- Google Drive file ID (if applicable)

2. **document\_template\_fields**

   * id \- Unique identifier

   * template\_id \- Associated template

   * field\_key \- Field key for placeholder (e.g., CLIENT\_NAME)

   * field\_name \- Human-readable field name

   * field\_description \- Field description

   * field\_type \- Field type (text, number, date, etc.)

   * is\_required \- Required field flag

   * default\_value \- Default value for the field

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

3. **document\_template\_versions**

   * id \- Unique identifier

   * template\_id \- Associated template

   * version \- Version number

   * content \- Version content

   * changes \- Description of changes

   * created\_by \- User who created the version

   * created\_at \- Creation timestamp

4. **generated\_documents**

   * id \- Unique identifier

   * template\_id \- Associated template

   * document\_name \- Generated document name

   * document\_data \- Data used for generation (JSON)

   * content \- Generated content

   * file\_id \- Google Drive file ID (if applicable)

   * file\_url \- URL to access the file

   * created\_by \- User who generated the document

   * created\_at \- Creation timestamp

   * updated\_at \- Last update timestamp

   * related\_entity\_type \- Related entity type (order, customer, etc.)

   * related\_entity\_id \- ID of related entity

### **API Endpoints**

#### *Get All Templates*

GET /api/document-templates

**Query Parameters:** \- type \- Filter by document type \- is\_active \- Filter by active status (true/false) \- department\_id \- Filter by department ID \- page \- Page number for pagination \- limit \- Number of results per page

**Response:**

{  
  "success": **true**,  
  "data": {  
    "templates": \[  
      {  
        "id": 1,  
        "title": "Basic Contract",  
        "type": "contract",  
        "description": "Basic contract template with standard clauses",  
        "is\_active": **true**,  
        "version": 1,  
        "created\_by": 123,  
        "created\_at": "2025-04-01T10:00:00.000Z",  
        "updated\_at": "2025-04-01T10:00:00.000Z",  
        "department\_id": 1,  
        "format": "html",  
        "file\_id": **null**,  
        "created\_by\_name": "John Manager",  
        "department\_name": "Legal"  
      },  
      **//** **More** **templates...**  
    \],  
    "pagination": {  
      "page": 1,  
      "limit": 10,  
      "total": 5,  
      "total\_pages": 1  
    }  
  }  
}

#### *Get Template by ID*

GET /api/document-templates/:id

**Response:**

{  
  "success": **true**,  
  "data": {  
    "id": 1,  
    "title": "Basic Contract",  
    "type": "contract",  
    "content": "\<h1\>CONTRACT № {{CONTRACT\_NUMBER}}\</h1\>\\n\<p\>{{CONTRACT\_DATE}}\</p\>\\n\<p\>{{COMPANY\_NAME}}, represented by {{COMPANY\_REPRESENTATIVE}},\</p\>\\n\<p\>and {{CLIENT\_NAME}}, represented by {{CLIENT\_REPRESENTATIVE}},\</p\>\\n\<p\>have agreed as follows:\</p\>\\n...",  
    "description": "Basic contract template with standard clauses",  
    "is\_active": **true**,  
    "version": 1,  
    "created\_by": 123,  
    "created\_at": "2025-04-01T10:00:00.000Z",  
    "updated\_at": "2025-04-01T10:00:00.000Z",  
    "department\_id": 1,  
    "format": "html",  
    "file\_id": **null**,  
    "created\_by\_name": "John Manager",  
    "department\_name": "Legal",  
    "fields": \[  
      {  
        "id": 1,  
        "template\_id": 1,  
        "field\_key": "CONTRACT\_NUMBER",  
        "field\_name": "Contract Number",  
        "field\_description": "Unique contract reference number",  
        "field\_type": "text",  
        "is\_required": **true**,  
        "default\_value": **null**  
      },  
      {  
        "id": 2,  
        "template\_id": 1,  
        "field\_key": "CONTRACT\_DATE",  
        "field\_name": "Contract Date",  
        "field\_description": "Date when contract is signed",  
        "field\_type": "date",  
        "is\_required": **true**,  
        "default\_value": **null**  
      },  
      **//** **More** **fields...**  
    \],  
    "versions": \[  
      {  
        "id": 1,  
        "template\_id": 1,  
        "version": 1,  
        "content": "...",  
        "changes": "Initial version",  
        "created\_by": 123,  
        "created\_at": "2025-04-01T10:00:00.000Z",  
        "created\_by\_name": "John Manager"  
      }  
    \]  
  }  
}

#### *Create Template*

POST /api/document-templates

**Request Body:**

{  
  "title": "Sales Proposal",  
  "type": "proposal",  
  "content": "\<h1\>PROPOSAL\</h1\>\\n\<p\>{{PROPOSAL\_DATE}}\</p\>\\n\<p\>Dear {{CLIENT\_NAME}},\</p\>\\n\<p\>{{COMPANY\_NAME}} is pleased to offer the following proposal:\</p\>\\n...",  
  "description": "Sales proposal template with pricing table",  
  "is\_active": **true**,  
  "department\_id": 3,  
  "format": "html",  
  "fields": \[  
    {  
      "field\_key": "PROPOSAL\_DATE",  
      "field\_name": "Proposal Date",  
      "field\_description": "Date of proposal",  
      "field\_type": "date",  
      "is\_required": **true**  
    },  
    {  
      "field\_key": "CLIENT\_NAME",  
      "field\_name": "Client Name",  
      "field\_description": "Full client name",  
      "field\_type": "text",  
      "is\_required": **true**  
    },  
    **//** **More** **fields...**  
  \]  
}

**Response:**

{  
  "success": **true**,  
  "data": {  
    "id": 3  
  },  
  "message": "Template successfully created"  
}

#### *Update Template*

PUT /api/document-templates/:id

**Request Body:** Same format as Create Template

**Response:**

{  
  "success": **true**,  
  "message": "Template successfully updated"  
}

#### *Delete Template*

DELETE /api/document-templates/:id

**Response:**

{  
  "success": **true**,  
  "message": "Template successfully deleted"  
}

#### *Generate Document*

POST /api/document-templates/:id/generate

**Request Body:**

{  
  "data": {  
    "CONTRACT\_NUMBER": "CTR-2025-123",  
    "CONTRACT\_DATE": "April 10, 2025",  
    "COMPANY\_NAME": "Expanse Corp",  
    "COMPANY\_REPRESENTATIVE": "John Doe, CEO",  
    "CLIENT\_NAME": "Acme Inc.",  
    "CLIENT\_REPRESENTATIVE": "Jane Smith, Procurement Manager",  
    "SERVICES\_COST": "10,000",  
    "CURRENCY": "USD"  
  },  
  "document\_name": "Contract with Acme Inc.",  
  "save\_to\_drive": **true**,  
  "related\_entity\_type": "customer",  
  "related\_entity\_id": 789  
}

**Response:**

{  
  "success": **true**,  
  "data": {  
    "id": 5,  
    "content": "\<h1\>CONTRACT № CTR-2025-123\</h1\>\\n\<p\>April 10, 2025\</p\>\\n\<p\>Expanse Corp, represented by John Doe, CEO,\</p\>\\n\<p\>and Acme Inc., represented by Jane Smith, Procurement Manager,\</p\>\\n\<p\>have agreed as follows:\</p\>\\n...",  
    "fileId": "1AbCdEfGhIjKlMnOpQrStUvWxYz",  
    "fileUrl": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view"  
  },  
  "message": "Document successfully generated"  
}

#### *Get Generated Documents*

GET /api/document-templates/generated

**Query Parameters:** \- related\_entity\_type \- Filter by related entity type \- related\_entity\_id \- Filter by related entity ID \- user\_id \- Filter by creator ID \- page \- Page number for pagination \- limit \- Number of results per page

**Response:**

{  
  "success": **true**,  
  "data": {  
    "documents": \[  
      {  
        "id": 5,  
        "template\_id": 1,  
        "document\_name": "Contract with Acme Inc.",  
        "file\_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz",  
        "file\_url": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view",  
        "created\_by": 123,  
        "created\_at": "2025-04-10T15:30:00.000Z",  
        "updated\_at": "2025-04-10T15:30:00.000Z",  
        "related\_entity\_type": "customer",  
        "related\_entity\_id": 789,  
        "created\_by\_name": "John Manager",  
        "template\_title": "Basic Contract",  
        "template\_type": "contract"  
      },  
      **//** **More** **documents...**  
    \],  
    "pagination": {  
      "page": 1,  
      "limit": 10,  
      "total": 5,  
      "total\_pages": 1  
    }  
  }  
}

#### *Get Generated Document by ID*

GET /api/document-templates/generated/:id

**Response:**

{  
  "success": **true**,  
  "data": {  
    "id": 5,  
    "template\_id": 1,  
    "document\_name": "Contract with Acme Inc.",  
    "document\_data": {  
      "CONTRACT\_NUMBER": "CTR-2025-123",  
      "CONTRACT\_DATE": "April 10, 2025",  
      "COMPANY\_NAME": "Expanse Corp",  
      "COMPANY\_REPRESENTATIVE": "John Doe, CEO",  
      "CLIENT\_NAME": "Acme Inc.",  
      "CLIENT\_REPRESENTATIVE": "Jane Smith, Procurement Manager",  
      "SERVICES\_COST": "10,000",  
      "CURRENCY": "USD"  
    },  
    "content": "\<h1\>CONTRACT № CTR-2025-123\</h1\>\\n\<p\>April 10, 2025\</p\>\\n\<p\>Expanse Corp, represented by John Doe, CEO,\</p\>\\n\<p\>and Acme Inc., represented by Jane Smith, Procurement Manager,\</p\>\\n\<p\>have agreed as follows:\</p\>\\n...",  
    "file\_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz",  
    "file\_url": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view",  
    "created\_by": 123,  
    "created\_at": "2025-04-10T15:30:00.000Z",  
    "updated\_at": "2025-04-10T15:30:00.000Z",  
    "related\_entity\_type": "customer",  
    "related\_entity\_id": 789,  
    "created\_by\_name": "John Manager",  
    "template\_title": "Basic Contract",  
    "template\_type": "contract"  
  }  
}

#### *Export Generated Document to PDF*

POST /api/document-templates/generated/:id/export-pdf

**Response:**

{  
  "success": **true**,  
  "data": {  
    "fileId": "1ZyXwVuTsRqPoNmLkJiHgFeDcBa",  
    "fileUrl": "https://drive.google.com/file/d/1ZyXwVuTsRqPoNmLkJiHgFeDcBa/view"  
  },  
  "message": "Document successfully exported to PDF"  
}

## **API Reference**

### **Common Patterns**

1. **Authentication**: All protected endpoints require a valid JWT token in the Authorization header:

* Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. **Pagination**: List endpoints support pagination with standard parameters:

   * limit: Number of results per page (default: 20\)

   * offset: Starting index for pagination

3. **Filtering**: List endpoints support filtering with endpoint-specific parameters

4. **Sorting**: List endpoints support sorting with:

   * orderBy: Field to sort by

   * order: Sort direction (asc or desc)

5. **Search**: List endpoints support searching with:

   * search: Search term to filter results

### **Response Format**

All API endpoints return responses in a consistent format:

{  
  "success": **true/false**,  
  "message": "Optional message about the operation",  
  "data": {  
    **//** **Endpoint-specific** **data**  
  },  
  "errors": {  
    **//** **Only** **present** **when** **success** **is** **false**  
    "field1": \["Error message 1", "Error message 2"\],  
    "field2": \["Error message"\]  
  }  
}

## **Common Response Formats**

### **Success Response**

{  
  "success": **true**,  
  "message": "Operation completed successfully",  
  "data": {  
    **//** **Operation** **result**  
  }  
}

### **Validation Error**

{  
  "success": **false**,  
  "message": "Validation failed",  
  "errors": {  
    "field1": \["Field is required"\],  
    "field2": \["Value must be a number"\]  
  }  
}

### **Authentication Error**

{  
  "success": **false**,  
  "message": "Authentication failed",  
  "errors": {  
    "auth": \["Invalid token", "Token expired"\]  
  }  
}

### **Permission Error**

{  
  "success": **false**,  
  "message": "Permission denied",  
  "errors": {  
    "permission": \["You do not have permission to perform this action"\]  
  }  
}

## **Error Handling**

### **HTTP Status Codes**

* **200 OK**: Successful operation

* **201 Created**: Resource created successfully

* **400 Bad Request**: Invalid request parameters

* **401 Unauthorized**: Authentication failure

* **403 Forbidden**: Permission denied

* **404 Not Found**: Resource not found

* **422 Unprocessable Entity**: Validation failure

* **500 Internal Server Error**: Server error

### **Error Response Format**

{  
  "success": **false**,  
  "message": "Error message",  
  "errors": {  
    "field": \["Specific error message"\]  
  }  
}