import random

ODD_NUMBERS = [1, 3, 5, 7, 9]
EVEN_NUMBERS = [0, 2, 4, 6, 8]

def create_board():
    return [[None for _ in range(3)] for _ in range(3)]

def is_winner(board):
    for line in get_all_lines():
        cells = [board[row][col] for row, col in line]
        if all(cell is not None for cell in cells) and sum(cells) == 15:
            print(f"Winning line found: {cells} for board: {board}")
            return True
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

def can_opponent_win(grid, line, opponent_number):
    cells = [grid[row][col] for row, col in line]
    empty_cells = [(row, col) for row, col in line if grid[row][col] is None]
    non_empty_cells = [cell for cell in cells if cell is not None]

    if len(empty_cells) == 1:
        current_sum = sum(non_empty_cells)
        can_win = (current_sum + opponent_number) == 15
        print(f"Checking if opponent can win with line: {line}, Result: {can_win}")
        return can_win
    return False

def get_available_moves(board):
    available = [(i, j) for i in range(3) for j in range(3) if board[i][j] is None]
    print(f"Available moves for board {board}: {available}")
    return available

def evaluate_board(board, ai_numbers, player_numbers):
    score = 0

    # Check for winning moves
    if is_winner(board):
        print("Current board state is a winning state.")
        return 10  # AI winning
    elif any(is_winner(simulate_move(board, (row, col), num)) for (row, col) in get_available_moves(board) for num in ai_numbers):
        score += 5  # Potential win
        print("AI can win in the next move.")
    
    # Check for blocking moves
    if any(can_opponent_win(board, line, num) for line in get_all_lines() for num in player_numbers):
        score -= 5  # Opponent can win in next move
        print("AI needs to block opponent's winning move.")
    
    print(f"Evaluating board: {board}, Score: {score}")
    return score

def simulate_move(board, move, number):
    new_board = [row[:] for row in board]
    new_board[move[0]][move[1]] = number
    return new_board

def ai_move(board, ai_numbers, player_numbers):
    best_move = None
    best_score = float('-inf')

    # Check for winning move
    for num in ai_numbers:
        for line in get_all_lines():
            if can_opponent_win(board, line, num):
                for row, col in line:
                    if board[row][col] is None:
                        board[row][col] = num
                        ai_numbers.remove(num)
                        print(f"AI placed {num} to win on line: {line}")
                        return

    # Block opponent if they can win
    for num in player_numbers:
        for line in get_all_lines():
            if can_opponent_win(board, line, num):
                for row, col in line:
                    if board[row][col] is None:
                        board[row][col] = 0
                        player_numbers.remove(0)
                        print(f"AI placed 0 to block opponent on line: {line}")
                        return

    # If no immediate winning or blocking move, choose the best available move
    for move in get_available_moves(board):
        for num in ai_numbers:
            new_board = simulate_move(board, move, num)
            score = evaluate_board(new_board, ai_numbers, player_numbers)
            if score > best_score:
                best_score = score
                best_move = (move, num)

    if best_move:
        move, chosen_number = best_move
        board[move[0]][move[1]] = chosen_number
        ai_numbers.remove(chosen_number)
        print(f"AI selected move: {move} with number {chosen_number}")

def print_board(board):
    print("-------------")
    for row in board:
        row_display = [" " if cell is None else str(cell) for cell in row]
        print("| " + " | ".join(row_display) + " |")
        print("-------------")

def main():
    print("Starting the Game of 15...")
    board = create_board()

    choice = input("Do you want to choose Odd or Even? (o/e) or start first (s): ").lower()

    if choice == 'o':
        player_numbers = ODD_NUMBERS.copy()
        ai_numbers = EVEN_NUMBERS.copy()
        print("You chose Odd. AI is Even.")
        turn = 'ai'  # AI starts
    elif choice == 'e':
        player_numbers = EVEN_NUMBERS.copy()
        ai_numbers = ODD_NUMBERS.copy()
        print("You chose Even. AI is Odd.")
        turn = 'ai'  # AI starts
    elif choice == 's':
        player_numbers = random.choice([ODD_NUMBERS.copy(), EVEN_NUMBERS.copy()])
        ai_numbers = EVEN_NUMBERS.copy() if player_numbers == ODD_NUMBERS else ODD_NUMBERS.copy()
        print(f"You will play first as {'Odd' if player_numbers == ODD_NUMBERS else 'Even'}. AI is {'Even' if player_numbers == ODD_NUMBERS else 'Odd'}.")
        turn = 'player'  # Player starts
    else:
        print("Invalid choice. Please restart the game.")
        return

    if turn == 'ai':
        # AI makes its initial move if AI starts
        print("AI is making its move...")
        ai_move(board, ai_numbers, player_numbers)
        print("AI has made its move.")
        print_board(board)

    while True:
        if turn == 'player':
            print("Current board:")
            print_board(board)

            while True:
                try:
                    row = int(input("Enter row (0, 1, 2): "))
                    col = int(input("Enter column (0, 1, 2): "))
                    number = int(input(f"Choose a number from your set {player_numbers}: "))

                    if (row, col) not in get_available_moves(board):
                        print("Invalid move: Cell already taken. Try again.")
                        continue

                    if number not in player_numbers:
                        print(f"Invalid number: Choose a number from your set {player_numbers}. Try again.")
                        continue

                    board[row][col] = number
                    player_numbers.remove(number)  # Remove the used number

                    print("New board after your move:")
                    print_board(board)

                    if is_winner(board):
                        print("You win!")
                        return

                    turn = 'ai'
                    break

                except ValueError:
                    print("Invalid input: Please enter numeric values for row, column, and number.")

        else:
            print("AI is making its move...")
            ai_move(board, ai_numbers, player_numbers)
            print("AI has made its move.")
            print_board(board)

            if is_winner(board):
                print("AI wins!")
                return

            turn = 'player'

if __name__ == '__main__':
    main()
