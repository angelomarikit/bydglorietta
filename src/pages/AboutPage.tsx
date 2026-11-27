import { FrameImage } from "../components/FrameImage";
import { useWebsite } from "../components/website-context";
import { ratios } from "../data/content";
import { storedImage } from "../lib/website";

type Leader = {
  photo: string;
  name: string;
  position: string;
};

export function AboutPage() {
  const { copy } = useWebsite();
  const about = copy.about;
  const showroom = storedImage(about.showroomPhoto, "");
  const leaders: Leader[] = [
    { photo: about.ceoPhoto, name: about.ceoName, position: about.ceoPosition },
    { photo: about.directorPhoto, name: about.directorName, position: about.directorPosition },
    { photo: about.operationsPhoto, name: about.operationsName, position: about.operationsPosition },
  ].flatMap((person) => {
    const name = person.name.trim();
    const position = person.position.trim();
    const photo = storedImage(person.photo, "");
    return name || position || photo ? [{ photo, name, position }] : [];
  });

  return (
    <main className="page about-page">
      <p className="kicker">{about.kicker}</p>
      <h1 className="page-title">{about.title}</h1>
      {about.description.trim() && <p className="about-description">{about.description}</p>}
      {showroom && (
        <FrameImage className="about-showroom" src={showroom} alt="BYD Glorietta showroom" ratio={ratios.gallery} />
      )}
      {leaders.length > 0 && (
        <div className="about-team">
          {leaders.map((person, index) => (
            <article className="about-person" key={`${person.name}-${person.position}-${index}`}>
              {person.photo ? (
                <img src={person.photo} alt="" />
              ) : (
                <span className="about-fallback" aria-hidden="true">{person.name.slice(0, 1) || "B"}</span>
              )}
              {person.name && <h2>{person.name}</h2>}
              {person.position && <p>{person.position}</p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
