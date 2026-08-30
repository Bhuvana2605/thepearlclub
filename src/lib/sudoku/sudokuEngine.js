/**
 * Comprehensive Sudoku Engine & Solver for Pearl Club Sanctuary
 * Includes backtracking solver, conflict detector, hint generator, and curated puzzle sets.
 */

// Collection of valid pre-filled Sudoku puzzles per difficulty
export const SUDOKU_PUZZLE_COLLECTION = {
  Easy: [
    [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0]
    ],
    [
      [1, 0, 0, 0, 0, 7, 0, 9, 0],
      [0, 3, 0, 0, 2, 0, 0, 0, 8],
      [0, 0, 9, 6, 0, 0, 5, 0, 0],
      [0, 0, 5, 3, 0, 0, 9, 0, 0],
      [0, 1, 0, 0, 8, 0, 0, 2, 0],
      [0, 0, 6, 0, 0, 4, 3, 0, 0],
      [0, 0, 3, 0, 0, 1, 2, 0, 0],
      [7, 0, 0, 0, 4, 0, 0, 6, 0],
      [0, 4, 0, 9, 0, 0, 0, 0, 5]
    ]
  ],
  Medium: [
    [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0]
    ],
    [
      [0, 0, 0, 6, 0, 0, 4, 0, 0],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 0, 0, 0, 9, 1, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 1, 8, 0, 0, 0, 3],
      [0, 0, 0, 3, 0, 6, 0, 4, 5],
      [0, 4, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 1, 0, 0]
    ]
  ],
  Hard: [
    [
      [0, 0, 0, 8, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 4, 3],
      [5, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 7, 0, 8, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 2, 0, 0, 3, 0, 0, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 7, 5],
      [0, 0, 3, 4, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 6, 0, 0]
    ],
    [
      [8, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 6, 0, 0, 0, 0, 0],
      [0, 7, 0, 0, 9, 0, 2, 0, 0],
      [0, 5, 0, 0, 0, 7, 0, 0, 0],
      [0, 0, 0, 0, 4, 5, 7, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 3, 0],
      [0, 0, 1, 0, 0, 0, 0, 6, 8],
      [0, 0, 8, 5, 0, 0, 0, 1, 0],
      [0, 9, 0, 0, 0, 0, 4, 0, 0]
    ]
  ]
};

/**
 * Checks if number placement at (row, col) is valid in board
 */
export function isValidPlacement(board, row, col, num) {
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }
  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;
  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return false;
    }
  }
  return true;
}

/**
 * Backtracking solver to get solved 9x9 matrix for any valid initial board
 */
export function solveSudoku(board) {
  const solved = JSON.parse(JSON.stringify(board));

  function solve() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (solved[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(solved, r, c, num)) {
              solved[r][c] = num;
              if (solve()) return true;
              solved[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve();
  return solved;
}

/**
 * Finds all cell coordinates "r-c" that currently have rule conflicts (duplicate numbers in row, col, or box)
 */
export function findBoardConflicts(board) {
  const conflictSet = new Set();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== 0) {
        if (!isValidPlacement(board, r, c, val)) {
          conflictSet.add(`${r}-${c}`);
        }
      }
    }
  }

  return conflictSet;
}

/**
 * Verifies if the Sudoku board is fully solved correctly with no empty cells and no conflicts
 */
export function isBoardSolved(board, solutionGrid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false;
      if (solutionGrid && solutionGrid[r][c] !== board[r][c]) {
        // Double check if valid placement
        if (!isValidPlacement(board, r, c, board[r][c])) return false;
      }
    }
  }
  return findBoardConflicts(board).size === 0;
}
