import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPublicAgents, type DirectoryAgent } from "../lib/agents";
import { Reveal } from "./Reveal";

const positions = [
  "Senior Sales Consultant",
  "Sales Consultant",
  "Sales Manager",
  "Sales Supervisor",
  "Sales Agent",
];

function agentLabel(fullName: string) {
  const trimmed = fullName.trim();
  const position = positions.find((item) => trimmed.toLowerCase().endsWith(item.toLowerCase()));
  if (!position) return { name: trimmed, position: "" };
  const name = trimmed.slice(0, trimmed.length - position.length).trim();
  return { name: name || trimmed, position };
}

export function AgentDirectory() {
  const [agents, setAgents] = useState<DirectoryAgent[] | null>(null);

  useEffect(() => {
    let cancel = false;
    listPublicAgents().then((next) => {
      if (!cancel) setAgents(next);
    });
    return () => {
      cancel = true;
    };
  }, []);

  if (!agents || agents.length === 0) return null;

  return (
    <section className="agents" aria-labelledby="agents-title">
      <Reveal>
        <h2 id="agents-title">Glorietta Sales Team</h2>
      </Reveal>
      <div className="agent-directory">
        {agents.map((person) => {
          const label = agentLabel(person.fullName);
          return (
          <Link key={person.pageIdentifier} className="agent-directory-card" to={`/agent/${person.pageIdentifier}`}>
            {person.photoUrl ? (
              <img src={person.photoUrl} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="agent-directory-fallback" aria-hidden="true">
                {person.fullName.trim().slice(0, 1)}
              </span>
            )}
            <span className="agent-directory-name">
              <strong>{label.name}</strong>
              {label.position && <small>{label.position}</small>}
            </span>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
