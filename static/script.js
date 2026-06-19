document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('usernameInput');
    const searchBtn = document.getElementById('searchBtn');
    const errorMessage = document.getElementById('errorMessage');
    const profileContainer = document.getElementById('profileContainer');

    // Search on Enter key
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUser();
        }
    });

    // Search on button click
    searchBtn.addEventListener('click', searchUser);

    // Focus input on load
    usernameInput.focus();

    async function searchUser() {
        const username = usernameInput.value.trim();
        
        if (!username) {
            showError('Please enter a GitHub username');
            return;
        }

        // Clear previous error and hide profile
        hideError();
        profileContainer.style.display = 'none';

        // Show loading state
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchBtn.disabled = true;
        usernameInput.disabled = true;

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username })
            });

            const data = await response.json();

            if (!response.ok) {
                showError(data.error || 'An error occurred');
                return;
            }

            // Display the profile data
            displayProfile(data);
            profileContainer.style.display = 'block';

        } catch (error) {
            showError('Network error. Please check your connection.');
            console.error('Error:', error);
        } finally {
            // Reset button state
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
            searchBtn.disabled = false;
            usernameInput.disabled = false;
        }
    }

    function displayProfile(data) {
        // Basic info
        document.getElementById('avatar').src = data.avatar_url;
        document.getElementById('name').textContent = data.name || data.login;
        document.getElementById('username').innerHTML = `<a href="${data.html_url}" target="_blank">@${data.login}</a>`;
        document.getElementById('bio').textContent = data.bio || 'No bio available';

        // Details
        document.getElementById('company').textContent = data.company || 'Not specified';
        document.getElementById('location').textContent = data.location || 'Not specified';
        
        // Email
        const emailElement = document.getElementById('email');
        if (data.email) {
            emailElement.innerHTML = `<a href="mailto:${data.email}">${data.email}</a>`;
        } else {
            emailElement.textContent = 'Not public';
        }

        // Blog
        const blogElement = document.getElementById('blog');
        if (data.blog) {
            blogElement.href = data.blog;
            blogElement.textContent = data.blog.replace(/^https?:\/\//, '');
        } else {
            blogElement.textContent = 'Not specified';
            blogElement.href = '#';
            blogElement.style.color = '#586069';
            blogElement.style.cursor = 'default';
            blogElement.style.textDecoration = 'none';
        }

        // Twitter
        document.getElementById('twitter').textContent = data.twitter_username ? `@${data.twitter_username}` : 'Not specified';

        // Stats
        document.getElementById('repos').textContent = data.public_repos;
        document.getElementById('gists').textContent = data.public_gists;
        document.getElementById('followers').textContent = data.followers;
        document.getElementById('following').textContent = data.following;

        // Dates
        document.getElementById('createdAt').textContent = data.created_at || 'N/A';
        document.getElementById('updatedAt').textContent = data.updated_at || 'N/A';

        // Repositories
        const reposList = document.getElementById('reposList');
        reposList.innerHTML = '';

        if (data.repos && data.repos.length > 0) {
            data.repos.forEach(repo => {
                const repoItem = document.createElement('div');
                repoItem.className = 'repo-item';

                const languageColors = {
                    'JavaScript': '#f1e05a',
                    'Python': '#3572A5',
                    'Java': '#b07219',
                    'TypeScript': '#3178c6',
                    'HTML': '#e34c26',
                    'CSS': '#563d7c',
                    'C++': '#f34b7d',
                    'C#': '#178600',
                    'PHP': '#4F5D95',
                    'Ruby': '#701516',
                    'Go': '#00ADD8',
                    'Rust': '#dea584',
                    'Swift': '#ffac45',
                    'Kotlin': '#A97BFF'
                };

                const languageColor = repo.language ? languageColors[repo.language] || '#586069' : '#586069';

                repoItem.innerHTML = `
                    <h4><a href="${repo.html_url}" target="_blank">${repo.name}</a></h4>
                    ${repo.description ? `<p>${repo.description}</p>` : ''}
                    <div class="repo-meta">
                        ${repo.language ? `<span><span class="language-dot" style="background-color: ${languageColor}"></span>${repo.language}</span>` : ''}
                        <span><i class="fas fa-star"></i> ${repo.stars}</span>
                        <span><i class="fas fa-code-branch"></i> ${repo.forks}</span>
                        <span><i class="fas fa-clock"></i> ${repo.updated_at || 'Recently updated'}</span>
                    </div>
                `;

                reposList.appendChild(repoItem);
            });
        } else {
            reposList.innerHTML = '<p style="color: #586069; padding: 20px; text-align: center;">No public repositories found</p>';
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }
});
