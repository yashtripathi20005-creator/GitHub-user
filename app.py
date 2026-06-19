from flask import Flask, render_template, request, jsonify
import requests
import json
from datetime import datetime
import os

app = Flask(__name__)

# GitHub API base URL
GITHUB_API_URL = "https://api.github.com"

@app.route('/')
def index():
    """Render the main search page"""
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_user():
    """Search for GitHub user profile"""
    username = request.json.get('username', '').strip()
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    try:
        # Fetch user data from GitHub API
        user_response = requests.get(f"{GITHUB_API_URL}/users/{username}")
        
        if user_response.status_code == 404:
            return jsonify({'error': f'User "{username}" not found'}), 404
        elif user_response.status_code != 200:
            return jsonify({'error': 'GitHub API error. Please try again.'}), 500
        
        user_data = user_response.json()
        
        # Fetch user repos
        repos_response = requests.get(f"{GITHUB_API_URL}/users/{username}/repos?sort=updated&per_page=10")
        repos_data = repos_response.json() if repos_response.status_code == 200 else []
        
        # Process user data
        profile_data = {
            'login': user_data.get('login'),
            'name': user_data.get('name'),
            'avatar_url': user_data.get('avatar_url'),
            'html_url': user_data.get('html_url'),
            'bio': user_data.get('bio'),
            'company': user_data.get('company'),
            'location': user_data.get('location'),
            'email': user_data.get('email'),
            'blog': user_data.get('blog'),
            'twitter_username': user_data.get('twitter_username'),
            'public_repos': user_data.get('public_repos'),
            'public_gists': user_data.get('public_gists'),
            'followers': user_data.get('followers'),
            'following': user_data.get('following'),
            'created_at': format_date(user_data.get('created_at')),
            'updated_at': format_date(user_data.get('updated_at')),
            'repos': [
                {
                    'name': repo.get('name'),
                    'description': repo.get('description'),
                    'html_url': repo.get('html_url'),
                    'language': repo.get('language'),
                    'stars': repo.get('stargazers_count'),
                    'forks': repo.get('forks_count'),
                    'updated_at': format_date(repo.get('updated_at'))
                }
                for repo in repos_data[:10]
            ]
        }
        
        return jsonify(profile_data)
        
    except requests.exceptions.RequestException:
        return jsonify({'error': 'Network error. Please check your connection.'}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

def format_date(date_str):
    """Format ISO date string to readable format"""
    if not date_str:
        return None
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.strftime('%B %d, %Y at %I:%M %p')
    except:
        return date_str

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Page not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
