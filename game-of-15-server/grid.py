import json
import numpy as np
from itertools import permutations
import os

GRID_WIDTH = 3
GRID_HEIGHT = 3

FILE_PATH = "../game-of-15-datastorage/valid_grids.json"

# Function to check if any line in the grid sums to 15
def check_sum_15(grid):
    # Replace None with 0 for summation purposes
    grid = [0 if x is None else x for x in grid]
    grid = np.array(grid).reshape((3, 3))
    
    # Check rows, columns, and diagonals
    rows = np.sum(grid, axis=1)  # Sum across rows
    cols = np.sum(grid, axis=0)  # Sum across columns
    diag1 = np.sum(np.diagonal(grid))  # Main diagonal
    diag2 = np.sum(np.diagonal(np.fliplr(grid)))  # Anti-diagonal
    
    return (15 in rows) or (15 in cols) or (diag1 == 15) or (diag2 == 15)

# Function to generate all valid grids
def find_valid_grids():
    all_numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, None, None, None]
    all_grids = [list(p) for p in permutations(all_numbers, 9)]
    
    valid_grids = []
    count = 0

    for grid in all_grids:
        if check_sum_15(grid):
            valid_grids.append(grid)
            count += 1
            if count % 100 == 0:
                print(f"{count} valid grids found.")

    return valid_grids

# Function to save valid grids in batches
def save_valid_grids(valid_grids, file_path, batch_size=100):
    try:
        # Check if the directory exists, if not, create it
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'a') as file:
            for i in range(0, len(valid_grids), batch_size):
                batch = valid_grids[i:i+batch_size]
                for grid in batch:
                    # Store each grid as a single line in the JSON file
                    file.write(json.dumps(grid) + '\n')
        print(f"Valid grids successfully saved to {file_path}.")
    except Exception as e:
        print(f"Error saving file: {e}")

# Generate and save valid grids
valid_grids = find_valid_grids()
print(f"Total {len(valid_grids)} valid grids found.")
save_valid_grids(valid_grids, FILE_PATH)
