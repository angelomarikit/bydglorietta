import { Link } from "react-router-dom";
import { FrameImage } from "../components/FrameImage";
import { InquiryLink } from "../components/InquiryLink";
import { useWebsite } from "../components/website-context";
import { photos, ratios } from "../data/content";
import { storedImage } from "../lib/website";

const optionImages = [
  { src: photos.exterior[0], alt: "Delan Black Sealion 6, front three-quarter" },
  { src: photos.exterior[2], alt: "Delan Black Sealion 6, side view" },
  { src: photos.exterior[4], alt: "Delan Black Sealion 6, rear view" },
  { src: photos.interiorPremium[0], alt: "Premium interior", ratio: ratios.premium },
  { src: photos.spin[1], alt: "Sealion 6 Dynamic, Delan Black" },
  { src: photos.interior[3], alt: "Sealion 6 cabin detail" },
];

export function CarPage() {
  const { copy } = useWebsite();
  const car = copy.car;
  return (
    <main className="page">
      <p className="crumbs">
        <Link to="/">The lineup</Link>
        <span>/</span>
        <span>Sealion 6</span>
      </p>
      <div className="car-hero">
        <FrameImage src={storedImage(car.heroImage, photos.hero)} alt="Sealion 6 DM-i in Delan Black" ratio={ratios.gallery} priority />
        <div className="car-side">
          <FrameImage src={storedImage(car.frontImage, photos.exterior[1])} alt="Sealion 6 front view" ratio={ratios.gallery} priority />
          <FrameImage src={storedImage(car.cabinImage, photos.interior[0])} alt="Sealion 6 cabin" ratio={ratios.gallery} priority />
        </div>
      </div>
      <div className="meta-line">
        <span>Premium</span>
        <span>Super DM-i</span>
        <span>5 seats</span>
      </div>
      <h1 className="page-title">{car.title}</h1>
      <p className="price">{car.price}</p>
      <p className="muted">{car.priceNote}</p>
      <div className="spec-row">
        <article>
          <span className="muted">{car.rangeLabel}</span>
          <strong>{car.rangeValue}</strong>
        </article>
        <article>
          <span className="muted">{car.outputLabel}</span>
          <strong>{car.outputValue}</strong>
        </article>
        <article>
          <span className="muted">{car.batteryLabel}</span>
          <strong>{car.batteryValue}</strong>
        </article>
      </div>
      <div className="option-grid">
        {optionImages.map((item, index) => (
          <article key={item.alt}>
            <FrameImage src={storedImage(car[`optionImage${index}` as keyof typeof car], item.src)} alt={item.alt} ratio={item.ratio ?? ratios.gallery} />
            <h3>{car[`optionTitle${index}` as keyof typeof car]}</h3>
            <p className="muted">{car[`optionText${index}` as keyof typeof car]}</p>
          </article>
        ))}
      </div>
      <div className="accordion" style={{ marginTop: 48 }}>
        <details open>
          <summary>{car.showroomTitle}</summary>
          <p>{car.showroom}</p>
        </details>
        <details>
          <summary>{car.priceListTitle}</summary>
          <p>{car.priceList}</p>
        </details>
        <details>
          <summary>{car.notClaimTitle}</summary>
          <p>{car.notClaim}</p>
        </details>
      </div>
      <div className="note">
        <p className="kicker">{car.noteKicker}</p>
        <p>{car.note}</p>
        <Link className="btn gold" to="/order" style={{ marginTop: 20 }}>
          {car.testDrive}
        </Link>
      </div>
      <div className="quote-cta">
        <p>{car.quoteLine}</p>
        <InquiryLink className="btn gold" to="/contact">
          {car.quoteButton}
        </InquiryLink>
      </div>
    </main>
  );
}
