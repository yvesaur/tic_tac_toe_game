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
const GameController = (function () {
	const players = [];
	let currentPlayer;
	let isPlayerTurnCompleted = false;
	let movesMade = [];

	function addSubmitListenerToUserInfoForm() {
		const userInfoForm = document.querySelector(".user-info-form");

		if (userInfoForm) {
			const playerTypeOptions = document.querySelectorAll(
				`input[type="radio"][name^="player"][value="bot"], input[type="radio"][name^="player"][value="human"]`
			);
			const playerNameInputs = {
				player1_type: document.getElementById("player1_name"),
				player2_type: document.getElementById("player2_name"),
			};

			playerTypeOptions.forEach((option) => {
				option.addEventListener("change", () => {
					if (!option.checked) return;

					const nameInput = playerNameInputs[option.name];
					if (!nameInput) return;

					if (option.value === "bot") {
						nameInput.readOnly = true;
						nameInput.value = "bot";
					} else {
						nameInput.readOnly = false;
					}
				});
			});

			userInfoForm.addEventListener("submit", (e) => {
				e.preventDefault();

				const userInfoFormData = new FormData(userInfoForm);
				const player1Name = userInfoFormData.get("player1_name");
				const player1Type = userInfoFormData.get("player1_type");
				const player2Name = userInfoFormData.get("player2_name");
				const player2Type = userInfoFormData.get("player2_type");

				players.push(
					player1Type === "human"
						? CreatePlayer(player1Name, "O", player1Type)
						: CreateBot(player1Name, "O", player1Type)
				);
				players.push(
					player2Type === "human"
						? CreatePlayer(player2Name, "X", player2Type)
						: CreateBot(player2Name, "X", player2Type)
				);

				currentPlayer = players[0];

				ScreenController.initGameBoardComponent();
				ScreenController.updateGameInfo();
			});
		}
	}

	function handleRound(clickedCellLocation) {
		currentPlayer.playRound(clickedCellLocation);

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
	const getPlayer = (playerNo) => players[playerNo - 1];
	const getMovesMade = () => movesMade;
	//

	// Initializations
	addSubmitListenerToUserInfoForm();

	return {
		getCurrentPlayer,
		switchCurrentPlayer,
		handleRound,
		confirmPlayerTurn,
		addMovesMade,
		getMovesMade,
		resetGame,
		getPlayer,
	};
})();

const ScreenController = (function () {
	const gameBoardComponent = document.querySelector(".gameboard-component");
	const gameBoard = document.querySelector(".gameboard");
	const userInfoForm = document.querySelector(".user-info-form");
	const pageHeader = document.querySelector("header");
	const currentPlayerName = document.querySelector(".current-player-name");
	const currentPlayerMarker = document.querySelector(".current-player-marker");
	const player1Name = document.querySelector(".player1-name");
	const player2Name = document.querySelector(".player2-name");

	function initGameBoardComponent() {
		pageHeader.classList.add("game-start");
		userInfoForm.style.display = "none";
		gameBoardComponent.style.display = "flex";

		for (let cell of gameBoard.children) {
			cell.addEventListener("click", (e) => {
				GameController.handleRound(e.target.dataset.cellLocation);

				updateGameBoardValues();
				updateGameInfo();
			});
		}
	}

	function updateGameInfo() {
		currentPlayerName.textContent = `${GameController.getCurrentPlayer().getName()}'s`;
		currentPlayerMarker.textContent =
			GameController.getCurrentPlayer().getMarker();
		player1Name.textContent = GameController.getPlayer(1).getName();
		player2Name.textContent = GameController.getPlayer(2).getName();
	}

	function updateGameBoardValues() {
		const boardResult = Gameboard.getBoardResult().flat();

		for (let i = 0; i < boardResult.length; i++) {
			const cellValueContainer = document.createElement("span");
			if (boardResult[i] === "X" || boardResult[i] === "O") {
				cellValueContainer.textContent = boardResult[i];

				// Check if the Board Cell already has marker inside it
				if (gameBoard.children[i].children.length === 0) {
					gameBoard.children[i].append(cellValueContainer);
				}
			}
		}
	}

	return {
		initGameBoardComponent,
		updateGameInfo,
	};
})();

// Object that will handle the Player properties
function CreatePlayer(name, marker, playerType) {
	function playRound(clickedCellLocation) {
		const [moveRowPosition, moveColumnPosition] = clickedCellLocation;

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
