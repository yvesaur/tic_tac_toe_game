console.log("Test JS script... working");

// Object that will handle the board
const Gameboard = (function () {
	const boardColumnAndRow = 3;
	const board = [];

	// Generate 2D Array to simulate our game board
	for (let i = 0; i < boardColumnAndRow; i++) {
		board[i] = [];
		for (let j = 0; j < boardColumnAndRow; j++) {
			board[i].push(Cell());
		}
	}

	function putMarkerOnBoard(marker, cellRowPosition, cellColumnPosition) {
		board[cellRowPosition][cellColumnPosition].addMarker(marker);
	}

	// Data Fetching Methods
	const getBoard = () => board;

	const getBoardResult = () => {
		return board.map((row) => row.map((cell) => cell.getValue())); // Get board with updated data
	};
	//

	return { putMarkerOnBoard, getBoard, getBoardResult };
})();

// Object that will handle the game flow and logic
const GameController = (function (
	players = [CreatePlayer("Tom", "O"), CreatePlayer("Jerry", "X")]
) {
	let currentPlayer = players[0];
	let isPlayerTurnCompleted = false;

	function switchCurrentPlayer() {
		if (isPlayerTurnCompleted) {
			currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
		}
	}

	function confirmPlayerTurn(boolean) {
		isPlayerTurnCompleted = boolean ? true : false;
	}

	function playRound(cellRowPosition, cellColumnPosition) {
		Gameboard.putMarkerOnBoard(
			getCurrentPlayer().getMarker(),
			cellRowPosition,
			cellColumnPosition
		);

		// Check if there is a winner
		checkPatternForWinner();

		switchCurrentPlayer();
	}

	function checkPatternForWinner() {
		const boardLength = Gameboard.getBoard().length;
		const targetPatternForWin = [1, 2, 3].map(() =>
			getCurrentPlayer().getMarker()
		);

		const boardRowPatterns = Gameboard.getBoardResult();
		const boardColumnPatterns = [0, 1, 2].map(
			(colIndex) => boardRowPatterns.map((row) => row[colIndex]) // Get the column pattern values of the board (top to bottom)
		);
		const boardDiagonalPatterns = [
			boardRowPatterns.map((row, i) => row[i]), // Diagonal pattern values
			boardRowPatterns.map((row, i) => row[boardLength - 1 - i]), // Anti-diagonal pattern values
		];

		const boardPatterns = [
			...boardRowPatterns,
			...boardColumnPatterns,
			...boardDiagonalPatterns,
		];

		for (let i = 0; i < boardPatterns.length; i++) {
			const isWinnerPatternFound = boardPatterns[i].every(
				(cellValue, i) => cellValue === targetPatternForWin[i]
			);

			if (isWinnerPatternFound) {
				console.log("You Win");
				return true;
			}
		}
	}

	// Data Fetching Methods
	const getCurrentPlayer = () => currentPlayer;
	//

	return {
		getCurrentPlayer,
		switchCurrentPlayer,
		playRound,
		confirmPlayerTurn,
	};
})();

// Object that will handle the Player properties
function CreatePlayer(name, marker) {
	const getName = () => name;
	const getMarker = () => marker;

	return { getName, getMarker };
}

// Object that will handle the individual Cells of the Gameboard
function Cell() {
	let value = "_";

	function addMarker(playerMarker) {
		if (value === "_") {
			value = playerMarker;
			GameController.confirmPlayerTurn(true);
		} else {
			window.alert("Cell already has a marker. Please try again.");
			GameController.confirmPlayerTurn(false);
		}
	}

	// Data Fetching Methods
	const getValue = () => value;
	//

	return { addMarker, getValue };
}
