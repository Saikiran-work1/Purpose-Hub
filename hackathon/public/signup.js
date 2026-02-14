document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const securityQuestion = document.getElementById('securityQuestion').value;
  const securityAnswer = document.getElementById('securityAnswer').value;
  const messageDiv = document.getElementById('message');
  
  try {
    const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, securityQuestion, securityAnswer })
    });
    
    const data = await response.json();
    if (response.ok) {
      messageDiv.style.color = 'green';
      messageDiv.textContent = data.message;
      // Optionally redirect to login
      setTimeout(() => window.location.href = 'index.html', 2000);
    } else {
      messageDiv.textContent = data.error;
    }
  } catch (error) {
    messageDiv.textContent = 'An error occurred. Please try again.';
  }
});