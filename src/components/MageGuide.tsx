import type { ReactNode } from "react";

type MageGuideProps = {
  greeting?: string;
  message: ReactNode;
};

export function MageGuide({ greeting, message }: MageGuideProps) {
  return (
    <aside className="mage-guide" aria-label="Mago guida">
      <div className="mage-art" aria-hidden="true">
        <img src="/mage-guide.png" alt="" />
      </div>
      <div className="mage-balloon">
        {greeting ? <strong>{greeting}</strong> : null}
        {typeof message === "string" ? <p>{message}</p> : message}
      </div>
    </aside>
  );
}
