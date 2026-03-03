function openCourse(course) {
  localStorage.setItem("course", course);
  window.location.href = "lessons.html";
}