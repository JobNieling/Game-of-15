from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import concurrent.futures
import time
from ai import GameOf15
import math

GRID_WIDTH = 3
GRID_HEIGHT = 3

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

@app.route('/api/ai-move', methods=['POST'])
def ai_move():
    data = request.json
    grid = data['grid']
    available_numbers = data['available_numbers']
    current_player = data['currentPlayer']
    
    ai_numbers = [num for num in range(1, 10) if num % 2 == 0] if current_player == 'odd' else [num for num in range(1, 10) if num % 2 != 0]

    best_score = -math.inf
    best_move = None

    for i in range(GRID_HEIGHT):
        for j in range(GRID_WIDTH):
            if grid[i][j] == 0:
                for num in ai_numbers:
                    grid[i][j] = num
                    new_available_numbers = [n for n in available_numbers if n != num]
                    score = minimax(grid, new_available_numbers, False)
                    grid[i][j] = 0
                    print(f"Move: ({i}, {j}, {num}), Score: {score}")
                    if score > best_score:
                        best_score = score
                        best_move = (i, j, num)
                        print(f"Best move: {best_move}, Best score: {best_score}")
    
    # If no move found, AI might consider placing 0 to remove a number or place it somewhere
    if not best_move:
        for i in range(GRID_HEIGHT):
            for j in range(GRID_WIDTH):
                if grid[i][j] == 0:
                    best_move = (i, j, 0)
                    break
            if best_move:
                break
    
    if best_move:
        row, col, number = best_move
        grid[row][col] = number
        response = {'row': row, 'col': col, 'number': number}
    else:
        response = {'error': 'No valid move found'}

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
