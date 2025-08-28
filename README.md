# Resource Scheduling System – Advanced Academic Resource Scheduling System (Frontend)

## Overview

**Resource Scheduling System** is a feature-rich frontend application for a highly sophisticated academic scheduling system, used by university administration, advisors, and DEOs. It provides granular control and visibility over timetabling, batch and course management, preferences, compensatory classes, availability, and user/discipline management.  
**This frontend is tightly integrated with [FYPBackend](https://github.com/subhan-uf/fypbackend), which handles all data, business logic, and scheduling algorithms.**

---

## Deployment & Adoption

**The Resource Scheduling System is currently implemented at NED University of Engineering and Technology and actively used by multiple departments.**  
It streamlines complex scheduling workflows for faculty, advisors, and administrative staff across various academic programs.

---
## Key Features & Detailed Module Descriptions

### Dashboard
- Personalized welcome and quick navigation to all modules, with cards adapting to user role (Advisor or DEO).
- Immediate access to Teacher, Room, Course, Batch, Timetable Generation, Preferences, Compensatory Classes, Availability, Reports, User Management, and Discipline Management.

### Teacher Management
- List all teachers with search/filter capabilities.
- Add, edit, or delete teachers; fields include username, email, name, phone, staff ID, year, faculty, seniority.
- Form view for creating/updating teacher records.
- Advisors see only a view list, DEOs have full management access.

### Room Management
- View all rooms with search and filter.
- Add new rooms, edit existing, or delete rooms.
- Details include room number, type (lab/class), capacity, and status.
- Tabs separate viewing, editing, and creation, adapted for Advisor/DEO roles

### Course Management
- List all courses with search and filtering.
- Create, update, and delete courses.
- Assign courses to batches, teachers, and disciplines.
- View course details and associations.

### Batch Management
- List all batches with search/filter.
- Add new batches, edit, or delete existing batches.
- Assign sections, set max students, manage batch details.
- View batch timetables and assignments.

### Preferences & Constraints
- Set and view room preferences (floor, location, etc.).
- Set and view class time preferences (day, time slot).
- Search/filter preferences by room or course.
- Add, edit, and delete preference entries.
- Manage constraints to guide timetable generation (room suitability, time constraints).

### Timetable Generation
- Batch-wise timetable generation using advanced backend algorithms.
- View generated timetables, lock slots, disable days, and edit assignments.
- Status indicators for each timetable (Published, Pending, etc.).
- Modal for generation descriptions.
- Table view of all generations with ID, description, status, time, last editor, and actions.
- Interactive timetable UI: click slots to lock, click days to disable.

### Compensatory Classes
- Book, manage, and visualize compensatory sessions for missed or extra classes.
- Filter by week and session type (lab/theory).
- View compensatory timetables in grid format, overlaid with regular and compensatory classes, including breaks and Salah rows.
- Assign courses and rooms directly for compensatory sessions.

### Availability Tracking
- Real-time tracking of teacher and room availability.
- Tabs for "View teacher availability" and "View room availability".
- For teachers: see if currently teaching, which room, next class, and next available slot.
- For rooms: see if currently in use, which batch, next class, and next available time.
- Search teachers/rooms, sort by name and availability.
- Statuses (Available/Unavailable) are calculated dynamically based on timetable and current time.

### Reports
- Download/view PDF copies of generated timetables.
- Historical generations accessible for documentation and sharing.

### User Management (DEO only)
- Add, edit, and manage users (advisors, DEOs).
- Assign roles, update details, and manage all users in the system.
- Table and form views for easy bulk and individual management.

### Discipline Management (DEO only)
- Create and manage academic disciplines.
- Link disciplines to courses and batches for organizational clarity.

---

## Pages & Navigation

- `/dashboard`: Role-based entry point with quick links to all modules.
- `/teacher`: Teacher management (view/add/edit/delete).
- `/room`: Room management (view/add/edit/delete).
- `/course`: Course administration (view/add/edit/delete).
- `/batch`: Batch administration (view/add/edit/delete).
- `/preference`: Preferences and constraints setup (room and time).
- `/compensatory`: Compensatory class booking and visualization.
- `/generation`: Timetable generation, viewing, and editing.
- `/report`: PDF timetable reports.
- `/availability`: Real-time teacher and room availability.
- `/user`: User management (DEO only).
- `/disciplines`: Discipline management (DEO only).

Each page comes with advanced table views, forms, modals, and interactive components for data manipulation and visualization.

---

## Integration

**Backend:**  
Requires [FYPBackend](https://github.com/subhan-uf/fypbackend) for all data, scheduling logic, and API endpoints.  
Ensure the backend is deployed and configured for full system functionality.

---

Click on the image below for a working demo:


[![Watch Demo](https://img.youtube.com/vi/2wzoR2I6JvY/hqdefault.jpg)](https://youtu.be/2wzoR2I6JvY)


## License

Distributed under the MIT License.

---

## Support

For issues, feature requests or questions, [open an issue](https://github.com/subhan-uf/fypfinal/issues) or contact the repository owner.

---
