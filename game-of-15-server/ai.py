import math

GRID_WIDTH = 3
GRID_HEIGHT = 3

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
