// Step 1: Get security question
document.getElementById('getQuestionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = ''; // Clear previous messages
  
  try {
    const response = await fetch('http://localhost:3000/get-security-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    if (response.ok) {
      document.getElementById('securityQuestionText').textContent = `Question: ${data.securityQuestion}`;
      document.getElementById('questionSection').style.display = 'block';
      document.getElementById('getQuestionForm').style.display = 'none'; // Hide step 1
    } else {
      messageDiv.textContent = data.error;
    }
  } catch (error) {
    messageDiv.textContent = 'An error occurred. Please try again.';
  }
});

// Step 2: Reset password
document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const securityAnswer = document.getElementById('securityAnswer').value;
  const newPassword = document.getElementById('newPassword').value;
  const messageDiv = document.getElementById('message');
  
  try {
    const response = await fetch('http://localhost:3000/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, securityAnswer, newPassword })
    });
    
    const data = await response.json();
    if (response.ok) {
      messageDiv.style.color = 'green';
      messageDiv.textContent = data.message;
      // Redirect to login after success
      setTimeout(() => window.location.href = 'index.html', 2000);
    } else {
      messageDiv.textContent = data.error;
    }
  } catch (error) {
    messageDiv.textContent = 'An error occurred. Please try again.';
  }
});