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
	players = [CreatePlayer("Tom", "O", "human"), CreateBot("Jerry", "X", "bot")]
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

	function handleRound() {
		// 1. Get player move and update board
		currentPlayer.playRound();

		// 2. Check available patterns if there is a winner
		checkPatternForWinner();

		// 3. Switch to next player if there is no winner (next turn)
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

		console.log(boardRowPatterns);

		const boardPatterns = [
			...boardRowPatterns,
			...boardColumnPatterns,
			...boardDiagonalPatterns,
		];

		for (let i = 0; i < boardPatterns.length; i++) {
			// Compare each pattern fetched to the target pattern
			const isWinnerPatternFound = boardPatterns[i].every(
				(cellValue, i) => cellValue === targetPatternForWin[i]
			);

			if (isWinnerPatternFound) {
				console.log(getCurrentPlayer().getName() + " won.");
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
		handleRound,
		confirmPlayerTurn,
	};
})();

// Object that will handle the Player properties
function CreatePlayer(name, marker, playerType) {
	function playRound() {
		// Prompt user for the position of his/her move
		const cellRowColumnPosition = window
			.prompt("Enter cell position: (<row><column>)")
			.split("")
			.map(Number);

		Gameboard.putMarkerOnBoard(
			getMarker(),
			cellRowColumnPosition[0],
			cellRowColumnPosition[1]
		);
	}

	// Data Fetching Methods
	const getName = () => name;
	const getMarker = () => marker;
	const getPlayerType = () => playerType;
	//

	return { getName, getMarker, getPlayerType, playRound };
}

// Object that will handle the Bot properties
function CreateBot(name, marker, playerType) {
	// Inherit similar values/methods to Player object
	const { getName, getMarker, getPlayerType } = CreatePlayer(
		name,
		marker,
		playerType
	);

	async function playRound() {
		const botMovePosition = [generateRandomMove(2), generateRandomMove(2)];

		Gameboard.putMarkerOnBoard(
			getMarker(),
			botMovePosition[0],
			botMovePosition[1]
		);
	}

	// Will generate random numerical values base on the range (return = 0 - range)
	function generateRandomMove(range) {
		return Math.floor(Math.random() * (range + 1));
	}

	return { getName, getMarker, getPlayerType, playRound };
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
