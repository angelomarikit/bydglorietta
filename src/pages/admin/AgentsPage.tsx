import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAgent, listAgents, pageAddress, setAgentHidden, type ManagedAgent } from "../../lib/agents";

export function AgentsPage() {
  const [agents, setAgents] = useState<ManagedAgent[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setAgents(await listAgents());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The sales agent list could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function copy(identifier: string) {
    await navigator.clipboard.writeText(pageAddress(identifier));
    setCopied(identifier);
    window.setTimeout(() => setCopied(""), 2000);
  }

  async function toggle(agent: ManagedAgent) {
    const next = !agent.hidden;
    const question = next
      ? `Hide ${agent.fullName}'s page? The link will stop opening.`
      : `Show ${agent.fullName}'s page again?`;
    if (!window.confirm(question)) return;
    setError("");
    try {
      await setAgentHidden(agent.pageIdentifier, next);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The page could not be updated.");
    }
  }

  async function remove(agent: ManagedAgent) {
    const question = `Delete ${agent.fullName}? This removes the page, the link, and the uploaded photos and video. This cannot be undone.`;
    if (!window.confirm(question)) return;
    setError("");
    try {
      await deleteAgent(agent);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The sales agent could not be deleted.");
    }
  }

  return (
    <div className="admin-panel wide">
      <div className="admin-heading">
        <div>
          <p className="kicker">Sales Agents</p>
          <h1>Sales Agents</h1>
        </div>
        <Link className="btn gold" to="/admin/agents/new">
          Add Sales Agent
        </Link>
      </div>
      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p aria-busy="true">Loading sales agents.</p>
      ) : agents.length === 0 ? (
        <p>No sales agents yet.</p>
      ) : (
        <div className="agent-list">
          {agents.map((agent) => {
            const address = pageAddress(agent.pageIdentifier);
            return (
              <article key={agent.pageIdentifier} className="agent-row">
                <div>
                  <h2>{agent.fullName}</h2>
                  <p>{agent.contactNumber}</p>
                  <p className="muted">{agent.hidden ? "Hidden" : "Active"}</p>
                  <a href={address}>{address}</a>
                </div>
                <div className="admin-actions">
                  <button className="btn quiet" type="button" onClick={() => copy(agent.pageIdentifier)}>
                    {copied === agent.pageIdentifier ? "Copied" : "Copy Link"}
                  </button>
                  <a className="btn quiet" href={address} target="_blank" rel="noreferrer">
                    View Page
                  </a>
                  <Link className="btn" to={`/admin/agents/${agent.pageIdentifier}`}>
                    Edit Details
                  </Link>
                  <button className="btn" type="button" onClick={() => toggle(agent)}>
                    {agent.hidden ? "Show Page" : "Hide Page"}
                  </button>
                  <button className="btn" type="button" onClick={() => remove(agent)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
