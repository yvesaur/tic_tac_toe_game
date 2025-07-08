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

	function clearBoardValues() {
		board.map((row) => row.map((cell) => cell.clearValue()));
	}

	// Data Fetching Methods
	const getBoard = () => board;

	const getBoardResult = () => {
		return board.map((row) => row.map((cell) => cell.getValue())); // Get board with updated data
	};

	const getAllBoardPatterns = () => {
		const boardLength = getBoard().length;

		const boardRowPatterns = getBoardResult();
		const boardColumnPatterns = [0, 1, 2].map(
			(colIndex) => boardRowPatterns.map((row) => row[colIndex]) // Get the column pattern values of the board (top to bottom)
		);
		const boardDiagonalPatterns = [
			boardRowPatterns.map((row, i) => row[i]), // Diagonal pattern values
			boardRowPatterns.map((row, i) => row[boardLength - 1 - i]), // Anti-diagonal pattern values
		];

		console.table(boardRowPatterns);

		return [
			...boardRowPatterns,
			...boardColumnPatterns,
			...boardDiagonalPatterns,
		];
	};
	//

	return {
		putMarkerOnBoard,
		getBoard,
		getBoardResult,
		getAllBoardPatterns,
		clearBoardValues,
	};
})();

// Object that will handle the game flow and logic
const GameController = (function (
	players = [CreatePlayer("Tom", "O", "human"), CreateBot("Jerry", "X", "bot")]
) {
	let currentPlayer = players[0];
	let isPlayerTurnCompleted = false;
	let movesMade = [];

	function handleRound() {
		currentPlayer.playRound();

		checkPatternForWinnerOrTie();

		switchCurrentPlayer();
	}

	function switchCurrentPlayer() {
		if (isPlayerTurnCompleted) {
			currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
		}
	}

	function confirmPlayerTurn(boolean) {
		isPlayerTurnCompleted = boolean ? true : false;
	}

	function checkPatternForWinnerOrTie() {
		const targetPatternForWin = [1, 2, 3].map(() =>
			getCurrentPlayer().getMarker()
		);

		const boardPatterns = Gameboard.getAllBoardPatterns();

		for (let i = 0; i < boardPatterns.length; i++) {
			// Compare all of the pattern to the target pattern
			const isWinnerPatternFound = boardPatterns[i].every(
				(cellValue, i) => cellValue === targetPatternForWin[i]
			);

			if (isWinnerPatternFound) {
				console.log(getCurrentPlayer().getName() + " won.");
				console.log("Game will now reset.");
				return resetGame();
			}
		}

		// Board has been filled up - Tie
		if (movesMade.length === 9) {
			console.log("It's a tie. No one won.");
			console.log("Game will now reset.");
			resetGame();
		}
	}

	function addMovesMade(cellPosition) {
		movesMade.push(cellPosition);
	}

	function resetGame() {
		Gameboard.clearBoardValues();
		movesMade.length = 0; // Clear all the moves made;
	}

	// Data Fetching Methods
	const getCurrentPlayer = () => currentPlayer;
	const getMovesMade = () => movesMade;
	//

	return {
		getCurrentPlayer,
		switchCurrentPlayer,
		handleRound,
		confirmPlayerTurn,
		addMovesMade,
		getMovesMade,
		resetGame,
	};
})();

// Object that will handle the Player properties
function CreatePlayer(name, marker, playerType) {
	function playRound() {
		// Prompt user for the position of his/her move
		const [moveRowPosition, moveColumnPosition] = window
			.prompt("Enter cell position: (<row><column>)")
			.split("")
			.map(Number);

		console.log(moveRowPosition, moveColumnPosition);

		Gameboard.putMarkerOnBoard(
			getMarker(),
			moveRowPosition,
			moveColumnPosition
		);

		GameController.addMovesMade(`${moveRowPosition}${moveColumnPosition}`);
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

	function playRound() {
		const movesMade = GameController.getMovesMade();

		let [botMoveRowPosition, botMoveColumnPosition] = generateRandomMove(2);
		let isMoveUnique = false;

		console.log(GameController.getMovesMade());

		// This will iterate until Bot generated move is unique
		do {
			let existingMoveCompareResults = [];

			for (let i = 0; i < movesMade.length; i++) {
				// Compare the current bot move to all the moves made
				console.log(
					movesMade[i] + " = " + `${botMoveRowPosition}${botMoveColumnPosition}`
				);
				if (movesMade[i] === `${botMoveRowPosition}${botMoveColumnPosition}`) {
					existingMoveCompareResults.push(true);
				} else {
					existingMoveCompareResults.push(false);
				}
			}

			isMoveUnique = existingMoveCompareResults.includes(true) ? false : true;

			if (!isMoveUnique) {
				[botMoveRowPosition, botMoveColumnPosition] = generateRandomMove(2);
			}
		} while (!isMoveUnique);
		isMoveUnique = false; // Reset the unique move flag

		Gameboard.putMarkerOnBoard(
			getMarker(),
			botMoveRowPosition,
			botMoveColumnPosition
		);

		GameController.addMovesMade(
			`${botMoveRowPosition}${botMoveColumnPosition}`
		);
	}

	// Will generate random numerical values base on the range (return = 0 - range)
	function generateRandomMove(range) {
		const targetRange = range + 1;
		return [
			Math.floor(Math.random() * targetRange),
			Math.floor(Math.random() * targetRange),
		];
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

	function clearValue() {
		value = "_";
	}

	// Data Fetching Methods
	const getValue = () => value;
	//

	return { addMarker, getValue, clearValue };
}
