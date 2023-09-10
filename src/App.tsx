import { useState, useEffect } from 'react';
import React from 'react';

interface SquareProps {
    key?: any;
    value: string;
    winClass?: string;
    onSquareClick: React.MouseEventHandler<HTMLButtonElement>;
}

function Square({ value, winClass, onSquareClick }: SquareProps) {
    let className = "square";
    if (winClass) {
        className += " " + winClass;
    }

    return (
        <button className={className}
            onClick={onSquareClick}>
            {value}
        </button>
    );
}

interface BoardProps {
    xIsNext: boolean;
    squares: string[];
    onPlay(nextSquares?: string[]): void;
}



function Board({ xIsNext, squares, onPlay }: BoardProps) {

    function handleClick(i: number) {
        if (squares[i] || calculateWinner(squares).winner != null) {
            return;
        }

        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = "X";
        } else {
            nextSquares[i] = "O";
        }
        onPlay(nextSquares)
    }

    const winner = calculateWinner(squares);
    let status: string;
    if (winner.winner == "TIE") {
        status = "Game is a draw!";
    } else if (!winner.winner) {
        status = "Next player is " + ((xIsNext) ? "X" : "O");
    } else {
        status = "Winner is " + winner.winner + "!";
    }

    function boardCols(num: number) {
        let content: React.ReactNode[] = [];
        [0, 1, 2].map(num1 => {
            let newNum = num + num1;
            let winClass: string = '';
            if (winner.line && winner.line.indexOf(newNum) > -1) {
                winClass = "win";
            }
            content.push(<Square
                key={newNum}
                value={squares[newNum]}
                winClass={winClass}
                onSquareClick={() => handleClick(newNum)} />);
        });
        return content;
    }

    const boardRows = [0, 1, 2].map((num) => num * 3).map(num => {
        return <div key={num} className="board-row">{boardCols(num)}</div>
    });

    return (
        <>
            <div className="status">{status}</div>
            {boardRows}
        </>
    );
}

interface Position {
    row: number;
    col: number;
}

export default function Game() {
    const [history, setHistory] = useState<(string[])[]>([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState<number>(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares: Array<string>) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove: number) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((squares: string[], move: number) => {
        let description;
        if (move > 0) {
            let prevSquares: string[] = history[move - 1];
            let position: Position[] = [];
            squares.map((item: string, idx: number) => {
                if ((squares[idx] && !prevSquares[idx]) === true) {
                    let row = Math.floor(idx / 3);
                    let col = idx % 3;
                    position.push({ row: row, col: col });
                }
            });
            description = "Go to move:" + move +
                ", position:" + "(" + position[0].row + "," + position[0].col + ")";
        } else {
            description = "Go to game start";
        }

        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{description}</button>
            </li>
        );

    });


    return (
        <>
            <div className="game">
                <div className="game-board">
                    <Board
                        xIsNext={xIsNext}
                        squares={currentSquares}
                        onPlay={handlePlay} />
                </div>
                <div className="game-info">
                    <ol>{moves}</ol>
                </div>
            </div>

        </>
    );
}


function calculateWinner(squares: string[]) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    let allSelected = true;
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: lines[i] };
        }
        if (!squares[a] || !squares[b] || !squares[c]) {
            allSelected = false;
        }
    }
    return { winner: (allSelected) ? "TIE" : null };
}
