import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { AgentContactModal } from "../components/AgentContactModal";
import { AgentContext, ContactModalContext } from "../components/agent-context";
import { InquiryLink } from "../components/InquiryLink";
import { photos } from "../data/content";
import { contactOptions, getPublicAgent, type PublicAgent } from "../lib/agents";
import { useWebsite } from "../components/website-context";
import { NotFoundPage } from "../pages/NotFoundPage";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/car-details", label: "Car details", end: false },
  { to: "/order", label: "Test drive", end: false },
  { to: "/blog", label: "Blog", end: false },
  { to: "/contact", label: "Contact", end: false },
];

type AgentState =
  | { status: "dealership" }
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; agent: PublicAgent };

export function SiteLayout() {
  const { agentIdentifier } = useParams();
  const { copy } = useWebsite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const [agentState, setAgentState] = useState<AgentState>(agentIdentifier ? { status: "loading" } : { status: "dealership" });

  useEffect(() => {
    if (!agentIdentifier) {
      setAgentState({ status: "dealership" });
      setContactOpen(false);
      return;
    }
    let cancel = false;
    setAgentState({ status: "loading" });
    setContactOpen(false);
    getPublicAgent(agentIdentifier).then((agent) => {
      if (cancel) return;
      setAgentState(agent ? { status: "ready", agent } : { status: "missing" });
    });
    return () => {
      cancel = true;
    };
  }, [agentIdentifier]);

  useEffect(() => {
    if (!agentIdentifier) return;
    const existing = document.querySelector('meta[name="robots"]');
    const meta = existing ?? document.createElement("meta");
    const created = !existing;
    if (created) {
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute("content");
    meta.setAttribute("content", "noindex");
    return () => {
      if (created) meta.remove();
      else if (previous === null) meta.removeAttribute("content");
      else meta.setAttribute("content", previous);
    };
  }, [agentIdentifier]);

  const agent = agentState.status === "ready" ? agentState.agent : null;
  const waiting = Boolean(agentIdentifier) && agentState.status === "loading";

  return (
    <AgentContext.Provider value={agent}>
      <ContactModalContext.Provider value={{ open: () => setContactOpen(true) }}>
        {agentIdentifier ? (
          <div className="brand" aria-label="BYD Glorietta">
            <img src={photos.logoWhite} alt="BYD" />
          </div>
        ) : (
          <NavLink to="/" className="brand" aria-label="BYD Glorietta">
            <img src={photos.logoWhite} alt="BYD" />
          </NavLink>
        )}
        {!agentIdentifier && (
          <header className="nav">
            <nav className={menuOpen ? "nav-links open" : "nav-links"}>
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <button
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </header>
        )}
        {waiting ? <main className="page" aria-busy="true" /> : agentState.status === "missing" ? <NotFoundPage /> : <Outlet />}
        {!waiting && <footer className={agentIdentifier ? "footer agent-footer-page" : "footer"}>
          <div className="footer-logo">
            <img src={photos.logoWhite} alt="BYD" />
          </div>
          <h2>{copy.footer.visit}</h2>
          <div className="footer-row">
            <div>
              <div className="acm">
                <img src={photos.acmobilityWhite} alt="ACMobility" />
              </div>
              <p className="muted" style={{ color: "#cacaca", marginTop: 12, maxWidth: 420 }}>
                {copy.footer.about}
              </p>
              {agent && <AgentFooterDetails agent={agent} />}
            </div>
            <InquiryLink className="btn light" to="/order">
              {copy.footer.testDrive}
            </InquiryLink>
          </div>
          {!agentIdentifier && (
            <nav>
              <NavLink to="/car-details">Sealion 6</NavLink>
              <InquiryLink to="/order">Test drive</InquiryLink>
              <InquiryLink to="/contact">Contact</InquiryLink>
              <NavLink to="/blog">{copy.blog.kicker}</NavLink>
            </nav>
          )}
          <small>{copy.footer.copyright}</small>
        </footer>}
        {agent && contactOpen && <AgentContactModal agent={agent} onClose={closeContact} />}
      </ContactModalContext.Provider>
    </AgentContext.Provider>
  );
}

function AgentFooterDetails({ agent }: { agent: PublicAgent }) {
  const options = contactOptions(agent);
  return (
    <div className="agent-footer">
      {agent.photoUrl && <img src={agent.photoUrl} alt="" />}
      <div>
        <strong>{agent.fullName}</strong>
        <div className="agent-footer-links">
          {options.map((option) => (
            <a key={option.label} href={option.href} {...(option.external ? { target: "_blank", rel: "noreferrer" } : {})}>
              {option.label === "Call" ? agent.contactNumber : option.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
