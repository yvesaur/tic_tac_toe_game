console.log("Test JS script... working");

function createPlayer(name, selectedMarker) {
	function makeMove(movePosition) {
		gameBoard.board.push(`${selectedMarker}-${movePosition}`);
	}

	return { name, selectedMarker, makeMove };
}

const gameBoard = (function () {
	const boardColumnAndRow = 3;
	const board = [];

	return { board };
})();

const gameController = (function () {
	const player1 = createPlayer("Tom", "O");
	const player2 = createPlayer("Jerry", "X");
	return { player1, player2 };
})();
