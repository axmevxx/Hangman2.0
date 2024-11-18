import * as readline from "readline";
import * as fs from "fs";

class Hangman {
  private word: string;
  private guessedLetters: string[];
  private attempts: number;
  private usedLetters: string[];
  private rl: readline.Interface;
  private language: string;
  private won: boolean;

  constructor(word: string, attempts: number, language: string) {
    this.word = word.toLowerCase();
    this.attempts = attempts;
    this.guessedLetters = Array(word.length).fill("_");
    this.usedLetters = [];
    this.language = language;
    this.won = false;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  startGame(onGameEnd: (won: boolean) => void): void {
    const promptText =
      this.language === "en" ? "Enter a letter: " : "Введи букву: ";
    this.rl.question(promptText, (answer) => {
      if (answer.length !== 1) {
        console.log(
          this.language === "en"
            ? "Error: Enter only one letter."
            : "Ошибка: введи только одну букву."
        );
        this.startGame(onGameEnd);
      } else if (!this.isValidLetter(answer)) {
        console.log(
          this.language === "en"
            ? "Error: Enter a letter, not a symbol."
            : "Ошибка: введи букву, а не символ."
        );
        this.startGame(onGameEnd);
      } else {
        this.guess(answer.toLowerCase());
        if (!this.isGameOver()) {
          this.startGame(onGameEnd);
        } else {
          this.showStatus();
          this.won = this.hasWon();
          this.rl.close();
          onGameEnd(this.won);
        }
      }
    });
  }

  isValidLetter(letter: string): boolean {
    return this.language === "en"
      ? /^[a-z]$/i.test(letter)
      : /^[а-яё]$/i.test(letter);
  }

  guess(letter: string): void {
    if (this.usedLetters.includes(letter)) {
      console.log(
        this.language === "en"
          ? `You already used this letter: ${letter}`
          : `Вы уже использовали эту букву: ${letter}`
      );
      return;
    }
    this.usedLetters.push(letter);
    if (this.word.includes(letter)) {
      this.word.split("").forEach((char, index) => {
        if (char === letter) {
          this.guessedLetters[index] = char;
        }
      });
    } else {
      this.attempts--;
    }

    this.showStatus();
  }

  showStatus(): void {
    console.log(
      `${this.language === "en" ? "Word" : "Слово"}: ${this.guessedLetters.join(
        " "
      )}`
    );
    console.log(
      `${
        this.language === "en"
          ? "Remaining attempts"
          : "Оставшиеся попытки"
      }: ${this.attempts}`
    );
    console.log(
      `${
        this.language === "en" ? "Used letters" : "Использованные буквы"
      }: ${this.usedLetters.join(", ")}`
    );
    if (this.isGameOver()) {
      if (this.hasWon()) {
        console.log(
          this.language === "en"
            ? `You won! The word was: ${this.word}`
            : `Вы выиграли! Слово было: ${this.word}`
        );
      } else {
        console.log(
          this.language === "en"
            ? `You lost! The word was: ${this.word}`
            : `Вы проиграли! Загаданное слово было: ${this.word}`
        );
      }
    }
  }

  isGameOver(): boolean {
    return this.attempts === 0 || this.hasWon();
  }

  hasWon(): boolean {
    return !this.guessedLetters.includes("_");
  }
}

function startGameRounds(language: string, rounds: number): void {
  const fileName = language === "en" ? "wordsEN.txt" : "wordsRU.txt";
  let wins = 0;
  let losses = 0;

  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      console.error(
        language === "en"
          ? "Error reading file. Please make sure the file exists."
          : "Ошибка чтения файла. Убедитесь, что файл существует."
      );
      return;
    }
    const words = data.split("\n").filter((word) => word.trim().length > 0);

    function playRound(round: number): void {
      if (round > rounds) {
        console.log(
          language === "en"
            ? `Game over! Wins: ${wins}, Losses: ${losses}`
            : `Игра окончена! Победы: ${wins}, Поражения: ${losses}`
        );
        if (wins > losses) {
          console.log(language === "en" ? "You won the game!" : "Вы выиграли игру!");
        } else if (losses > wins) {
          console.log(language === "en" ? "You lost the game!" : "Вы проиграли игру!");
        } else {
          console.log(language === "en" ? "It's a draw!" : "Ничья!");
        }
        askPlayAgain(language);
        return;
      }

      const word = words[Math.floor(Math.random() * words.length)];
      const game = new Hangman(word, 5, language);
      console.log(
        language === "en"
          ? `Round ${round} of ${rounds}`
          : `Раунд ${round} из ${rounds}`
      );

      game.startGame((won) => {
        if (won) {
          wins++;
        } else {
          losses++;
        }
        playRound(round + 1);
      });
    }

    playRound(1);
  });
}

function askPlayAgain(language: string): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    language === "en"
      ? "Do you want to play again? (yes/no) "
      : "Хотите сыграть снова? (да/нет) ",
    (answer) => {
      if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "да") {
        rl.close();
        startNewGame(language);
      } else {
        console.log(language === "en" ? "Thanks for playing!" : "Спасибо за игру!");
        rl.close();
      }
    }
  );
}

function startNewGame(language: string = "") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (!language) {
    rl.question("Choose your language / Выберите язык (en/ru): ", (lang) => {
      const selectedLanguage = lang.toLowerCase();
      if (selectedLanguage === "en" || selectedLanguage === "ru") {
        rl.close();
        startNewGame(selectedLanguage);
      } else {
        console.log("Invalid choice / Неверный выбор.");
        rl.close();
        startNewGame();
      }
    });
    return;
  }

  rl.question(
    language === "en"
      ? "How many rounds do you want to play? "
      : "Сколько раундов вы хотите сыграть? ",
    (rounds) => {
      const roundsNum = parseInt(rounds);
      if (isNaN(roundsNum) || roundsNum <= 0) {
        console.log(
          language === "en"
            ? "Please enter a valid number of rounds."
            : "Введите корректное количество раундов."
        );
        rl.close();
        startNewGame(language);
      } else {
        rl.close();
        startGameRounds(language, roundsNum);
      }
    }
  );
}

startNewGame();