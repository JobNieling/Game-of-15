from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Path to the scoreboard file
SCOREBOARD_FILE = '../game-of-15-datastorage/scoreboard.json'

# Load existing scoreboard data or initialize if the file does not exist
def load_scoreboard():
    if os.path.exists(SCOREBOARD_FILE):
        with open(SCOREBOARD_FILE, 'r') as f:
            return json.load(f)
    else:
        return {'even': 0, 'odd': 0, 'tie': 0}

# Save scoreboard data to file
def save_scoreboard(scoreboard):
    with open(SCOREBOARD_FILE, 'w') as f:
        json.dump(scoreboard, f, indent=4)

# Initialize scoreboard
scoreboard = load_scoreboard()

@app.route('/api/scoreboard', methods=['GET'])
def get_scoreboard():
    return jsonify(scoreboard)

@app.route('/api/update-scoreboard', methods=['POST'])
def update_scoreboard():
    global scoreboard
    data = request.json

    # Update scoreboard with received data
    for key in data:
        if key in scoreboard:
            scoreboard[key] += data.get(key, 0)

    # Save updated scoreboard to file
    save_scoreboard(scoreboard)

    # Return updated scoreboard
    return jsonify(scoreboard)

@app.route('/api/reset-scoreboard', methods=['POST'])
def reset_scoreboard():
    global scoreboard
    scoreboard = {'even': 0, 'odd': 0, 'tie': 0}
    save_scoreboard(scoreboard)
    return jsonify(scoreboard)

if __name__ == '__main__':
    app.run(debug=True)
