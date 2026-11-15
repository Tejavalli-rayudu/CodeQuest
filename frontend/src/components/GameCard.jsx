
import { ArrowUpRight } from "lucide-react";

function GameCard({ icon, title, description, level, color, link }) {
  return (
    <div className="game-card">
      <div className="game-card-top">
        <div className={`game-icon ${color}`}>
          {icon}
        </div>
        <span className="level-tag">{level}</span>
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      <a href={link} className="play-link">
        Play Now <ArrowUpRight size={18} />
      </a>
    </div>
  );
}

export default GameCard;
