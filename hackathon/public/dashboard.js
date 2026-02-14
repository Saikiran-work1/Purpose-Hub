const token = localStorage.getItem('token'); // Assume token is stored after login
if (!token) {
  window.location.href = 'index.html'; // Redirect if not logged in
}

document.getElementById('motiveForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const motive = document.getElementById('motive').value;
  const messageDiv = document.getElementById('message');
  
  try {
    const response = await fetch(`http://localhost:3000/dashboard?motive=${motive}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      document.getElementById('feed').style.display = 'block';
      document.getElementById('motiveForm').style.display = 'none';
      const postsDiv = document.getElementById('posts');
      postsDiv.innerHTML = data.posts.map(post => `<div class="post">${post}</div>`).join('');
    } else {
      messageDiv.textContent = data.error;
    }
  } catch (error) {
    messageDiv.textContent = 'An error occurred. Please try again.';
  }
});

// Placeholder tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tabContent').textContent = `Content for ${tab.dataset.tab} tab.`;
  });
});

document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('content', document.getElementById('postContent').value);
  formData.append('category', document.getElementById('postCategory').value);
  formData.append('file', document.getElementById('postFile').files[0]);

  try {
    const response = await fetch('http://localhost:3000/create-post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert('Post created!');
      location.reload();
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert('Error creating post');
  }
});
document.getElementById("createPostBtn").addEventListener("click", () => {
  const postSection = document.getElementById("postSection");
  postSection.style.display = 
    postSection.style.display === "none" ? "block" : "none";
});
async function loadPosts() {
  const response = await fetch('http://localhost:3000/posts');
  const posts = await response.json();

  const container = document.getElementById('postsContainer');
  container.innerHTML = "";

  posts.forEach(post => {
    const div = document.createElement('div');
    div.classList.add('post');

    div.innerHTML = `
      <p><strong>${post.category}</strong></p>
      <p>${post.content}</p>
      ${post.image ? `<img src="/uploads/${post.image}" width="200">` : ""}
      <hr>
    `;

    container.appendChild(div);
  });
}

loadPosts();



// Logout
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});