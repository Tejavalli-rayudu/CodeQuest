
import {
  Code2,
  Bug,
  Terminal,
  Puzzle,
  Trophy,
  Flame,
  Star
} from "lucide-react";

import GameCard from "../components/GameCard";

function Home() {
  const games = [
    {
      icon: <Code2 size={28} />,
      title: "Code Quiz",
      description: "Test your programming knowledge with exciting questions.",
      level: "Beginner",
      color: "purple",
      link: "/games/quiz"
    },
    {
      icon: <Bug size={28} />,
      title: "Bug Hunter",
      description: "Find and fix errors hidden inside code snippets.",
      level: "Intermediate",
      color: "green",
      link: "/games/bug-hunter"
    },
    {
      icon: <Terminal size={28} />,
      title: "Output Master",
      description: "Predict the output and prove your coding skills.",
      level: "Beginner",
      color: "orange",
      link: "/games/output"
    },
    {
      icon: <Puzzle size={28} />,
      title: "Missing Code",
      description: "Complete incomplete programs and solve challenges.",
      level: "Advanced",
      color: "blue",
      link: "/games/missing-code"
    }
  ];

  return (
    <div className="home-page">

      <section className="hero">
        <div className="hero-content">
          <span className="hero-label">
            <Flame size={16} /> LEVEL UP YOUR CODING
          </span>

          <h1>
            Your Coding Journey
            <br />
            Starts <span>Here.</span>
          </h1>

          <p>
            Learn programming through fun challenges, solve puzzles,
            hunt bugs and become a coding champion.
          </p>

          <a href="#games" className="hero-btn">
            Explore Games <Code2 size={19} />
          </a>
        </div>

        <div className="hero-art">
          <div className="code-window">
            <div className="window-dots">
              <i></i><i></i><i></i>
              <span>challenge.js</span>
            </div>

            <div className="code-content">
              <p><span>01</span> <b>function</b> <em>levelUp</em>() {"{"}</p>
              <p><span>02</span> &nbsp; let skills = <strong>100</strong>;</p>
              <p><span>03</span> &nbsp; return <em>"Success!"</em>;</p>
              <p><span>04</span> {"}"}</p>
              <br />
              <p className="success-code">
                <span>05</span> &gt; Ready to play?_
              </p>
            </div>
          </div>

          <div className="floating-star">
            <Star size={25} fill="currentColor" />
          </div>
        </div>
      </section>

      <section className="stats">
        <div>
          <Trophy size={25} />
          <h3>4</h3>
          <p>Exciting Games</p>
        </div>
        <div>
          <Code2 size={25} />
          <h3>3</h3>
          <p>Difficulty Levels</p>
        </div>
        <div>
          <Flame size={25} />
          <h3>∞</h3>
          <p>Learning Challenges</p>
        </div>
      </section>

      <section className="games-section" id="games">
        <div className="section-heading">
          <div>
            <span className="section-label">CHOOSE YOUR CHALLENGE</span>
            <h2>Explore Our Games</h2>
            <p>Pick a game and start your coding adventure.</p>
          </div>
        </div>

        <div className="games-grid">
          {games.map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
      </section>

      <footer className="footer">
        <h3>CodeQuest</h3>
        <p>Learn. Play. Code. Conquer.</p>
        <p>© 2026 CodeQuest. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default Home;
