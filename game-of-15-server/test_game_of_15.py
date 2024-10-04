import unittest
from game_of_15 import create_board, is_winner, get_all_lines, can_opponent_win, get_available_moves, ai_move

class TestGameOf15(unittest.TestCase):

    def test_create_board(self):
        print("Running test_create_board...")
        board = create_board()
        print(f"Board created: {board}")
        self.assertIsInstance(board, list)
        self.assertEqual(len(board), 3)
        self.assertEqual(len(board[0]), 3)
        self.assertTrue(all(cell is None for row in board for cell in row))  # All cells should be None

    def test_is_winner(self):
        print("Running test_is_winner...")
        winning_board = [[1, 2, 3], [4, 5, 6], [0, 0, 0]]
        result = is_winner(winning_board)
        print(f"Testing winning board: {winning_board}, Result: {result}")
        self.assertTrue(result)

        non_winning_board = [[1, 2, 3], [4, 5, None], [0, 0, 0]]
        result = is_winner(non_winning_board)
        print(f"Testing non-winning board: {non_winning_board}, Result: {result}")
        self.assertFalse(result)

    def test_get_all_lines(self):
        print("Running test_get_all_lines...")
        lines = get_all_lines()
        print(f"All lines: {lines}")
        self.assertEqual(len(lines), 8)  # There should be 8 lines

    def test_can_opponent_win(self):
        print("Running test_can_opponent_win...")
        board = [[1, 2, None], [4, 5, None], [None, 7, None]]
        opponent_number = 3
        line = [(0, 0), (0, 1), (0, 2)]  # Top row
        result = can_opponent_win(board, line, opponent_number)
        print(f"Checking if opponent can win with board: {board}, Line: {line}, Result: {result}")
        self.assertTrue(result)

        non_winning_board = [[1, 2, None], [4, None, 5], [None, 7, None]]
        result = can_opponent_win(non_winning_board, line, opponent_number)
        print(f"Checking if opponent can win with non-winning board: {non_winning_board}, Line: {line}, Result: {result}")
        self.assertFalse(result)

    def test_get_available_moves(self):
        print("Running test_get_available_moves...")
        board = [[1, None, 3], [None, 5, None], [7, 8, 9]]
        available_moves = get_available_moves(board)
        print(f"Available moves for board {board}: {available_moves}")
        self.assertIn((1, 0), available_moves)
        self.assertIn((0, 1), available_moves)
        self.assertNotIn((0, 0), available_moves)  # (0, 0) is taken

    def test_ai_move(self):
        print("Running test_ai_move...")
        board = [[1, None, None], [None, None, None], [None, 7, 9]]
        ai_numbers = [2, 3, 4, 5, 6, 8]
        player_numbers = [1, 7, 9]

        print(f"Initial board: {board}")
        ai_move(board, ai_numbers, player_numbers)
        print(f"Board after AI move: {board}")
        
        # Ensure AI has made a move
        self.assertNotEqual(board, [[1, None, None], [None, None, None], [None, 7, 9]])

    def test_ai_move_winning(self):
        print("Running test_ai_move_winning...")
        board = [[1, 2, 3], [None, None, None], [None, None, None]]
        ai_numbers = [4, 5, 6]  # Adjust based on available numbers
        player_numbers = [1, 2, 3]

        print(f"Initial board: {board}")
        ai_move(board, ai_numbers, player_numbers)  # Call the ai_move function directly
        print(f"Board after AI move: {board}")

        # Ensure AI has made a winning move
        self.assertIn(4, board[1])  # Adjust this based on expected AI behavior

    def test_ai_move_blocking(self):
        print("Running test_ai_move_blocking...")
        board = [[1, 2, None], [4, None, None], [None, 7, None]]
        ai_numbers = [3]
        player_numbers = [5, 6, 8]

        ai_move(board, ai_numbers, player_numbers)
        print(f"Board after AI move: {board}")

        # Check if AI blocked the opponent
        self.assertIn(3, board[0])  # AI should place 3 to block the win

if __name__ == '__main__':
    unittest.main()
