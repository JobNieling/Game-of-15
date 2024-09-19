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

# @app.route('/api/ai-move', methods=['POST'])
# def ai_move():
#     data = request.json
#     grid = data['grid']
#     available_numbers = data['available_numbers']
#     current_player = data['currentPlayer']
    
#     ai_numbers = [num for num in range(1, 10) if num % 2 == 0] if current_player == 'odd' else [num for num in range(1, 10) if num % 2 != 0]

#     best_score = -math.inf
#     best_move = None

#     for i in range(GRID_HEIGHT):
#         for j in range(GRID_WIDTH):
#             if grid[i][j] == "-":
#                 for num in ai_numbers:
#                     grid[i][j] = num
#                     new_available_numbers = [n for n in available_numbers if n != num]
#                     score = minimax(grid, new_available_numbers, False)
#                     grid[i][j] = "-"
#                     print(f"Move: ({i}, {j}, {num}), Score: {score}")
#                     if score > best_score:
#                         best_score = score
#                         best_move = (i, j, num)
#                         print(f"Best move: {best_move}, Best score: {best_score}")
    
#     # If no move found, AI might consider placing 0 to remove a number or place it somewhere
#     if not best_move:
#         for i in range(GRID_HEIGHT):
#             for j in range(GRID_WIDTH):
#                 if grid[i][j] == "-":
#                     best_move = (i, j, 0)
#                     break
#             if best_move:
#                 break
    
#     if best_move:
#         row, col, number = best_move
#         grid[row][col] = number
#         response = {'row': row, 'col': col, 'number': number}
#     else:
#         response = {'error': 'No valid move found'}

#     return jsonify(response)

class GameOf15:
    def __init__(self):
        # Initialize grid with None to represent empty cells
        self.grid = [[None] * GRID_WIDTH for _ in range(GRID_HEIGHT)]

    def is_winner(self, grid, player_numbers):
        # Check rows, columns, and diagonals for winning condition
        lines = (
            [grid[i] for i in range(GRID_HEIGHT)] +  # rows
            [[grid[i][j] for i in range(GRID_HEIGHT)] for j in range(GRID_WIDTH)] +  # columns
            [[grid[i][i] for i in range(GRID_WIDTH)], [grid[i][GRID_WIDTH - 1 - i] for i in range(GRID_WIDTH)]]  # diagonals
        )
        for line in lines:
            # Filter out None values and check if the sum of the line is 15 and all elements are in player_numbers
            line_sum = sum(num for num in line if num is not None)
            if line_sum == 15 and all(num in player_numbers for num in line if num is not None):
                return True
        return False

    def evaluate_grid(self, grid, player_numbers, opponent_numbers):
        if self.is_winner(grid, player_numbers):
            return 10
        if self.is_winner(grid, opponent_numbers):
            return -10
        if all(cell is not None for row in grid for cell in row):
            return 0
        return None

    def minimax(self, grid, available_numbers, player_numbers, opponent_numbers, is_ai_turn):
        score = self.evaluate_grid(grid, player_numbers, opponent_numbers)
        if score is not None:
            return score

        if is_ai_turn:
            best_score = -math.inf
            for i in range(GRID_HEIGHT):
                for j in range(GRID_WIDTH):
                    if grid[i][j] is None:  # Check for empty cell
                        for num in available_numbers:
                            grid[i][j] = num
                            new_available_numbers = [n for n in available_numbers if n != num]
                            score = self.minimax(grid, new_available_numbers, player_numbers, opponent_numbers, False)
                            grid[i][j] = None  # Reset cell after simulation
                            best_score = max(score, best_score)
            return best_score
        else:
            best_score = math.inf
            for i in range(GRID_HEIGHT):
                for j in range(GRID_WIDTH):
                    if grid[i][j] is None:  # Check for empty cell
                        for num in available_numbers:
                            grid[i][j] = num
                            new_available_numbers = [n for n in available_numbers if n != num]
                            score = self.minimax(grid, new_available_numbers, opponent_numbers, player_numbers, True)
                            grid[i][j] = None  # Reset cell after simulation
                            best_score = min(score, best_score)
            return best_score

    def find_best_move(self, grid, available_numbers, current_player):
        player_numbers = [num for num in range(1, 10) if num % 2 == 0] if current_player == 'even' else [num for num in range(1, 10) if num % 2 != 0]
        opponent_numbers = [num for num in range(1, 10) if num not in player_numbers]

        best_score = -math.inf
        best_move = None

        for num in player_numbers:
            if num in available_numbers:
                for i in range(GRID_HEIGHT):
                    for j in range(GRID_WIDTH):
                        if grid[i][j] is None:  # Check for empty cell
                            grid[i][j] = num
                            score = self.minimax(grid, [n for n in available_numbers if n != num], player_numbers, opponent_numbers, False)
                            grid[i][j] = None  # Reset cell after simulation
                            if score > best_score:
                                best_score = score
                                best_move = (i, j, num)
        
        return best_move if best_move else (None, None, None)

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