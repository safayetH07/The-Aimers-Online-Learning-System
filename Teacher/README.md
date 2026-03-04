# The Aimers - Teacher Side (Frontend)

## Files in this folder

| File | Purpose |
|------|---------|
| `style.css` | Shared CSS — same design as student side |
| `teacher_login.html` | Teacher login page |
| `teacher_register.html` | Teacher registration page |
| `teacher_dashboard.html` | Main teacher dashboard with stats |
| `teacher_courses.html` | Create & manage courses |
| `teacher_add_lesson.html` | Add new video lessons |
| `teacher_lessons.html` | View, edit, delete lessons |
| `teacher_students.html` | View enrolled students |
| `teacher_comments.html` | Read & reply to student comments |
| `student_auth.js` | **Replace** the student side `js/auth.js` with this |

---

## How to connect Student side ↔ Teacher side

Both sides use **localStorage** as a shared data layer:

| Key | Written by | Read by |
|-----|-----------|---------|
| `students` | Student register | Teacher → Students page |
| `lessons` | Teacher → Add Lesson | Student → Courses/Lessons pages |
| `t_courses` | Teacher → Courses | Student → Dashboard categories |
| `comments` | Student → Lesson page | Teacher → Comments page |
| `loggedInStudent` | Student login | Student pages |
| `loggedInTeacher` | Teacher login | Teacher pages |

---

## Setup Steps

1. Put both **student folder** and **teacher folder** in the same project directory inside XAMPP `htdocs/`.
2. Replace the student side `js/auth.js` with the provided `student_auth.js` (rename it).
3. Open `teacher_login.html` → Register → Login → full dashboard works.
4. Open student `login.html` → Register → Login → courses from teacher will appear.

---

## Day 4 Checklist ✅
- [x] Teacher Login / Register
- [x] Teacher Dashboard with stats
- [x] Create & manage courses
- [x] Add video lessons (YouTube embed)
- [x] Edit / delete lessons
- [x] View enrolled students
- [x] View & reply to student comments
- [x] Matches student frontend design (same CSS)
