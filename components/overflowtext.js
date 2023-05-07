import { useState } from "react";

function OverflowText({ text, maxLength }) {
  const [isTruncated, setIsTruncated] = useState(true);

  const toggleTruncate = () => {
    setIsTruncated(!isTruncated);
  };

  if (!text) {
      return <></>;
  }

  if (text.length <= maxLength) {
    return <div>{text}</div>;
  }

  return (
    <div>
      {isTruncated ? `${text.slice(0, maxLength)}...` : text}
      <a onClick={toggleTruncate} style={{color: 'blue', cursor: 'pointer'}}>
        {isTruncated ? "Read more" : "  Show less"}
      </a>
    </div>
  );
}

export default OverflowText;
