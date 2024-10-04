from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

GRID_WIDTH = 3
GRID_HEIGHT = 3

app = Flask(__name__)
CORS(app)

# Path to the scoreboard file
SCOREBOARD_FILE = '../game-of-15-datastorage/scoreboard.json'
GRID_STORAGE_DIR = '../game-of-15-datastorage/grid/'

# Ensure the directories exist or create them
def ensure_directory_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)

def save_grid_with_placement(grid, placement_order, result):
    file_mapping = {
        'player_win_odd': os.path.join(GRID_STORAGE_DIR, 'player_win_odd.json'),
        'player_win_even': os.path.join(GRID_STORAGE_DIR, 'player_win_even.json'),
        'ai_win_odd': os.path.join(GRID_STORAGE_DIR, 'ai_win_odd.json'),
        'ai_win_even': os.path.join(GRID_STORAGE_DIR, 'ai_win_even.json'),
        'tie': os.path.join(GRID_STORAGE_DIR, 'tie.json')
    }

    ensure_directory_exists(GRID_STORAGE_DIR)

    file_path = file_mapping.get(result)

    # Load existing grids
    grids = []
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            grids = json.load(f)

    # Check if the current grid's placement_order already exists
    placement_order_exists = any(existing['placement_order'] == placement_order for existing in grids)

    if placement_order_exists:
        return  # Exit the function if the placement order already exists

    # If the placement order doesn't exist, save it
    grid_data = {
        'grid': grid,
        'placement_order': placement_order,
        'winner': result
    }

    grids.append(grid_data)

    with open(file_path, 'w') as f:
        json.dump(grids, f, indent=4)

@app.route('/api/save-grid', methods=['POST'])
def save_grid_endpoint():
    data = request.get_json()
    grid = data['grid']
    placement_order = data['placement_order']
    result = data['result']
    
    save_grid_with_placement(grid, placement_order, result)

    return jsonify({'message': 'Grid saved successfully!'})

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

    for key in data:
        if key in scoreboard:
            scoreboard[key] += data.get(key, 0)

    save_scoreboard(scoreboard)

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
    opponent_available_numbers = data['opponent_available_numbers']
    current_player = data['currentPlayer']

    # Determine AI number based on current player
    ai_number = 1 if current_player == "odd" else 2

    # Check if opponent can win and block it
    for line in get_all_lines():
        for opponent_number in opponent_available_numbers:  # Ensure opponent_number is treated as an integer
            if isinstance(opponent_number, list):  # Ensure opponent_number is a single integer
                continue
            if can_opponent_win(grid, line, opponent_number):
                # Find an empty cell in that line to block the opponent
                for row, col in line:
                    if grid[row][col] is None:
                        return jsonify({'row': row, 'col': col, 'number': available_numbers[0]})

    # Check for immediate win or block for AI
    for line in get_all_lines():
        cells = [grid[row][col] for row, col in line]
        empty_cells = [(row, col) for row, col in line if grid[row][col] is None]
        non_empty_cells = [cell for cell in cells if cell is not None]
        current_sum = sum(non_empty_cells)

        if len(empty_cells) == 1:
            required_number = 15 - current_sum
            if required_number in available_numbers and required_number != 0:  # Avoid using number 0
                return jsonify({'row': empty_cells[0][0], 'col': empty_cells[0][1], 'number': required_number})

    # If no immediate win or block, choose best setup move
    for line in get_all_lines():
        cells = [grid[row][col] for row, col in line]
        empty_cells = [(row, col) for row, col in line if grid[row][col] is None]
        non_empty_cells = [cell for cell in cells if cell is not None]
        current_sum = sum(non_empty_cells)

        if len(empty_cells) > 1:
            for number in available_numbers:
                if (current_sum + number) <= 15 and number != 0:  # Avoid using number 0
                    return jsonify({'row': empty_cells[0][0], 'col': empty_cells[0][1], 'number': number})

    # If no strategic move is found, choose any available move
    for row in range(GRID_HEIGHT):
        for col in range(GRID_WIDTH):
            if grid[row][col] is None:
                for number in available_numbers:
                    if number != 0:  # Avoid using number 0
                        return jsonify({'row': row, 'col': col, 'number': number})

    return jsonify({'row': 0, 'col': 0, 'number': available_numbers[0]})

# Check if placing an opponent number in the empty cell will result in a win for the opponent
def can_opponent_win(grid, line, opponent_number):
    cells = [grid[row][col] for row, col in line]
    empty_cells = [(row, col) for row, col in line if grid[row][col] is None]
    non_empty_cells = [cell for cell in cells if cell is not None]

    # Simulate opponent move by adding their number to the sum of the non-empty cells
    if len(empty_cells) == 1:
        current_sum = sum(non_empty_cells)
        return (current_sum + opponent_number) == 15  # Ensure opponent_number is an integer
    return False

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
