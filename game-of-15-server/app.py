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
    data = request.get_json()
    grid = data['grid']
    available_numbers = data['available_numbers']
    current_player = data['currentPlayer']

    # Determine AI number based on current player
    ai_number = 1 if current_player == "odd" else 2

    # Check for immediate win or block
    for line in get_all_lines():
        cells = [grid[row][col] for row, col in line]
        empty_cells = [(row, col) for row, col in line if grid[row][col] is None]
        non_empty_cells = [cell for cell in cells if cell is not None]
        current_sum = sum(non_empty_cells)

        if len(empty_cells) == 1:
            required_number = 15 - current_sum
            if required_number in available_numbers:
                return jsonify({'row': empty_cells[0][0], 'col': empty_cells[0][1], 'number': required_number})

    # If no immediate win or block, choose best setup move
    for line in get_all_lines():
        cells = [grid[row][col] for row, col in line]
        empty_cells = [(row, col) for row, col in line if grid[row][col] is None]
        non_empty_cells = [cell for cell in cells if cell is not None]
        current_sum = sum(non_empty_cells)

        if len(empty_cells) > 1:
            for number in available_numbers:
                if (current_sum + number) <= 15:
                    return jsonify({'row': empty_cells[0][0], 'col': empty_cells[0][1], 'number': number})

    # If no strategic move is found, choose any available move
    for row in range(3):
        for col in range(3):
            if grid[row][col] is None:
                return jsonify({'row': row, 'col': col, 'number': available_numbers[0]})

    return jsonify({'row': 0, 'col': 0, 'number': available_numbers[0]})

def get_all_lines():
    return [
        [(0, 0), (0, 1), (0, 2)],  # Top row
        [(1, 0), (1, 1), (1, 2)],  # Middle row
        [(2, 0), (2, 1), (2, 2)],  # Bottom row
        [(0, 0), (1, 0), (2, 0)],  # Left column
        [(0, 1), (1, 1), (2, 1)],  # Middle column
        [(0, 2), (1, 2), (2, 2)],  # Right column
        [(0, 0), (1, 1), (2, 2)],  # Top-left to bottom-right diagonal
        [(0, 2), (1, 1), (2, 0)]   # Top-right to bottom-left diagonal
    ]

if __name__ == '__main__':
    app.run(debug=True)