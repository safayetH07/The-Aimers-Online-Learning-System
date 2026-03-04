// ===== STUDENT AUTH JS =====
// Saves students to localStorage so teacher dashboard can see them

function register() {
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  const students = JSON.parse(localStorage.getItem('students') || '[]');

  if (students.find(s => s.email === email)) {
    alert('This email is already registered.');
    return;
  }

  students.push({ name, email, password });
  localStorage.setItem('students', JSON.stringify(students));

  alert('Account created! Please login.');
  window.location.href = 'login.html';
}

function login() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const found    = students.find(s => s.email === email && s.password === password);

  if (found) {
    localStorage.setItem('loggedInStudent', JSON.stringify(found));
    window.location.href = 'dashboard.html';
  } else {
    alert('Invalid email or password.');
  }
}
