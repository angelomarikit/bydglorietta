import { useWebsite } from "../components/website-context";

type Center = {
  name: string;
  branch: string;
  phone: string;
  email: string;
};

function centersFrom(fields: Record<string, string>): Center[] {
  return [1, 2, 3, 4].flatMap((index) => {
    const center: Center = {
      name: fields[`center${index}Name`]?.trim() ?? "",
      branch: fields[`center${index}Branch`]?.trim() ?? "",
      phone: fields[`center${index}Phone`]?.trim() ?? "",
      email: fields[`center${index}Email`]?.trim() ?? "",
    };
    return center.name || center.branch || center.phone || center.email ? [center] : [];
  });
}

export function ServicePage() {
  const { copy } = useWebsite();
  const service = copy.service;
  const centers = centersFrom(service);

  return (
    <main className="page">
      <p className="kicker">{service.kicker}</p>
      <h1 className="page-title">{service.title}</h1>
      {service.intro.trim() && <p className="service-intro">{service.intro}</p>}
      {centers.length > 0 && (
        <div className="service-grid">
          {centers.map((center) => (
            <article className="service-card" key={`${center.name}-${center.branch}-${center.email}`}>
              <p className="kicker">Service center</p>
              {center.name && <h2>{center.name}</h2>}
              <dl>
                {center.branch && (
                  <div>
                    <dt>Branch</dt>
                    <dd>{center.branch}</dd>
                  </div>
                )}
                {center.phone && (
                  <div>
                    <dt>Contact number</dt>
                    <dd>
                      <a href={`tel:${center.phone.replace(/[^\d+]/g, "")}`}>{center.phone}</a>
                    </dd>
                  </div>
                )}
                {center.email && (
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${center.email}`}>{center.email}</a>
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
