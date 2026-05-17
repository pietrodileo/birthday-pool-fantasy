type MageGuideProps = {
  greeting?: string;
  message: string;
};

export function MageGuide({ greeting, message }: MageGuideProps) {
  return (
    <aside className="mage-guide" aria-label="Mago guida">
      <div className="mage-art" aria-hidden="true">
        <img src="/mage-guide.png" alt="" />
      </div>
      <div className="mage-balloon">
        {greeting ? <strong>{greeting}</strong> : null}
        <p>{message}</p>
      </div>
    </aside>
  );
}
