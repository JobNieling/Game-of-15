import unittest
from game_of_15 import create_board, is_winner, get_all_lines, can_opponent_win, get_available_moves, ai_move

class TestGameOf15(unittest.TestCase):

    def test_create_board(self):
        """Test the creation of the game board."""
        board = create_board()
        self.assertIsInstance(board, list, "Board should be a list")
        self.assertEqual(len(board), 3, "Board should have 3 rows")
        self.assertTrue(all(len(row) == 3 for row in board), "Each row should have 3 columns")
        self.assertTrue(all(cell is None for row in board for cell in row), "All cells should be None at the start")

    def test_is_winner(self):
        """Test if the is_winner function detects a winning board correctly."""
        winning_board = [[1, 2, 3], [4, 5, 6], [0, 0, 0]]
        self.assertTrue(is_winner(winning_board), "This board should result in a win")

        non_winning_board = [[1, 2, 3], [4, 5, None], [0, 0, 0]]
        self.assertFalse(is_winner(non_winning_board), "This board should not result in a win")

    def test_get_all_lines(self):
        """Test if get_all_lines returns all possible lines (rows, columns, diagonals)."""
        lines = get_all_lines()
        self.assertEqual(len(lines), 8, "There should be 8 lines (3 rows, 3 columns, 2 diagonals)")

    def test_can_opponent_win(self):
        """Test if the AI correctly identifies if the opponent can win."""
        board = [[1, 2, None], [4, 5, None], [None, 7, None]]
        opponent_number = 3
        line = [(0, 0), (0, 1), (0, 2)]  # Top row
        self.assertTrue(can_opponent_win(board, line, opponent_number), 
                        "Opponent should be able to win with this setup")

        non_winning_board = [[1, 2, None], [4, None, 5], [None, 7, None]]
        self.assertFalse(can_opponent_win(non_winning_board, line, opponent_number), 
                         "Opponent should not be able to win with this setup")

    def test_get_available_moves(self):
        """Test if get_available_moves returns correct empty cells on the board."""
        board = [[1, None, 3], [None, 5, None], [7, 8, 9]]
        available_moves = get_available_moves(board)
        expected_moves = [(0, 1), (1, 0), (1, 2)]
        
        self.assertCountEqual(available_moves, expected_moves, 
                              "The available moves should match the empty spots on the board")

    def test_ai_move(self):
        """Test if the AI correctly makes a move on the board."""
        board = [[1, None, None], [None, None, None], [None, 7, 9]]
        ai_numbers = [2, 3, 4, 5, 6, 8]
        player_numbers = [1, 7, 9]

        ai_move(board, ai_numbers, player_numbers)
        self.assertIn(None, [cell for row in board for cell in row], "AI should make a move on an empty spot")
        self.assertNotEqual(board, [[1, None, None], [None, None, None], [None, 7, 9]], 
                            "The board should change after AI's move")

    def test_ai_move_winning(self):
        """Test if the AI prioritizes winning when possible."""
        board = [[1, 2, 3], [None, None, None], [None, None, None]]
        ai_numbers = [4, 5, 6]
        player_numbers = [1, 2, 3]

        ai_move(board, ai_numbers, player_numbers)
        self.assertIn(4, board[1], "AI should place 4 to secure the win")

    def test_ai_move_blocking(self):
        """Test if the AI correctly blocks the player's winning move."""
        board = [[1, 2, None], [4, None, None], [None, 7, None]]
        ai_numbers = [3]
        player_numbers = [5, 6, 8]

        ai_move(board, ai_numbers, player_numbers)
        self.assertIn(3, board[0], "AI should place 3 to block the player from winning")

if __name__ == '__main__':
    unittest.main()
