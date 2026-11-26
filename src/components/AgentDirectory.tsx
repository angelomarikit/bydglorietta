import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPublicAgents, type DirectoryAgent } from "../lib/agents";
import { Reveal } from "./Reveal";

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
        <h2 id="agents-title">Sales agents</h2>
      </Reveal>
      <div className="agent-directory">
        {agents.map((person) => (
          <Link key={person.pageIdentifier} className="agent-directory-card" to={`/agent/${person.pageIdentifier}`}>
            {person.photoUrl ? (
              <img src={person.photoUrl} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="agent-directory-fallback" aria-hidden="true">
                {person.fullName.trim().slice(0, 1)}
              </span>
            )}
            <span className="agent-directory-name">{person.fullName}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
