from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
from collections import Counter

app = Flask(__name__)

def load_stop_words(filename='stop_words.txt'):
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            stop_words = set(word.strip().lower() for word in file.readlines())
        return stop_words
    except FileNotFoundError:
        print(f"Warning: Stop words file '{filename}' not found.")
        return set()

def extract_text_from_webpage(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        text = soup.get_text()
        return text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching webpage content: {e}")
        return None

def get_most_common_words(text, n=10, stop_words=None):
    if stop_words is None:
        stop_words = set()
    
    words = text.lower().split()
    words = [word for word in words if word.isalpha() and word not in stop_words]
    word_counts = Counter(words)
    return word_counts.most_common(n)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    url = request.form.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    stop_words = load_stop_words()
    text = extract_text_from_webpage(url)
    
    if text:
        common_words = get_most_common_words(text, n=20, stop_words=stop_words)
        return jsonify({'words': common_words})
    else:
        return jsonify({'error': 'Failed to fetch webpage content'}), 400

if __name__ == '__main__':
    app.run(debug=False)