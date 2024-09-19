from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import concurrent.futures
import time
import math

app = Flask(__name__)
# CORS(app)  # This will enable CORS for all routes

GRID_WIDTH = 3
GRID_HEIGHT = 3

@app.route('/api/ai-move', methods=['POST'])
class GameOf15:
    def __init__(self):
        self.grid = [[0] * GRID_WIDTH for _ in range(GRID_HEIGHT)]

    def is_winner(self, grid, player):
        # Check rows, columns, and diagonals
        lines = (
            [grid[i] for i in range(GRID_HEIGHT)] +  # rows
            [[grid[i][j] for i in range(GRID_HEIGHT)] for j in range(GRID_WIDTH)] +  # columns
            [[grid[i][i] for i in range(GRID_WIDTH)], [grid[i][GRID_WIDTH - 1 - i] for i in range(GRID_WIDTH)]]  # diagonals
        )
        for line in lines:
            if len(set(line)) == 1 and line[0] != 0:
                return True
        return False

    def is_tie(self, grid):
        return all(grid[i][j] != 0 for i in range(GRID_HEIGHT) for j in range(GRID_WIDTH))

    def evaluate_grid(self, grid):
        if self.is_winner(grid, 'AI'):
            return 10
        if self.is_winner(grid, 'Player'):
            return -10
        if all(cell != 0 for row in grid for cell in row):
            return 0
        return None

    def minimax(self, grid, available_numbers, is_ai_turn):
        score = self.evaluate_grid(grid)
        if score is not None:
            return score
        
        if is_ai_turn:
            best_score = -math.inf
            for i in range(GRID_HEIGHT):
                for j in range(GRID_WIDTH):
                    if grid[i][j] == 0:
                        for num in available_numbers:
                            grid[i][j] = num
                            new_available_numbers = [n for n in available_numbers if n != num]
                            score = self.minimax(grid, new_available_numbers, False)
                            grid[i][j] = 0
                            best_score = max(score, best_score)
                            print(f"AI: ({i}, {j}, {num}), Score: {score}")
            return best_score
        else:
            best_score = math.inf
            for i in range(GRID_HEIGHT):
                for j in range(GRID_WIDTH):
                    if grid[i][j] == 0:
                        for num in available_numbers:
                            grid[i][j] = num
                            new_available_numbers = [n for n in available_numbers if n != num]
                            score = self.minimax(grid, new_available_numbers, True)
                            grid[i][j] = 0
                            best_score = min(score, best_score)
            return best_score

    def find_best_move(self, grid, available_numbers, current_player):
        # Replace all None values in a grid with 0
        grid = [["-" if cell is None else cell for cell in row] for row in grid]

        # Determine AI's numbers based on the current player
        if current_player == 'odd':
            ai_numbers = [num for num in range(1, 10) if num % 2 == 0]  # Even numbers
        else:
            ai_numbers = [num for num in range(1, 10) if num % 2 != 0]  # Odd numbers

        best_score = -math.inf
        best_move = None
        best_number = None

        print(f"Current grid: {grid}")
        print(f"Available numbers: {available_numbers}")
        print(f"AI numbers: {ai_numbers}")

        for num in ai_numbers:
            if num in available_numbers:
                for i in range(GRID_HEIGHT):
                    for j in range(GRID_WIDTH):
                        if grid[i][j] == "-":  # Check for empty cell
                            grid[i][j] = num
                            score = self.minimax(grid, [n for n in available_numbers if n != num], 'Player' if current_player == 'AI' else 'AI')
                            grid[i][j] = "-"
                            print(f"Evaluated move: ({i}, {j}, {num}) with score: {score}")
                            if score > best_score:
                                best_score = score
                                best_move = (i, j, num)
                                best_number = num
        
        if best_move:
            # Remove the used number from available numbers
            available_numbers.remove(best_number)

        print(f"Best move: {best_move}")
        return best_move if best_move is not None else (None, None, None)

if __name__ == '__main__':
    app.run(debug=True)