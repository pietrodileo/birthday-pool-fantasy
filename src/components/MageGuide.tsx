type MageGuideProps = {
  title: string;
  message: string;
};

export function MageGuide({ title, message }: MageGuideProps) {
  return (
    <aside className="mage-guide" aria-label="Mago guida">
      <div className="mage-art" aria-hidden="true">
        <img src="/mage-guide.png" alt="" />
      </div>
      <div className="mage-copy">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </aside>
  );
}
