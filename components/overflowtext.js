import { useState } from 'react';
import { Box, Collapse, Typography } from '@mui/material';

/** Same truncation contract as before: show maxLength characters, then toggle. */
function OverflowText({ text, maxLength }) {
  const [isTruncated, setIsTruncated] = useState(true);

  const toggleTruncate = () => {
    setIsTruncated(!isTruncated);
  };

  if (!text) {
    return <></>;
  }

  if (text.length <= maxLength) {
    return <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{text}</Typography>;
  }

  return (
    <Box>
      <Collapse in={!isTruncated} collapsedSize="3.3em" timeout={220}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{text}</Typography>
      </Collapse>
      {/* A real button, so it is reachable by keyboard. */}
      <Box
        component="button"
        type="button"
        onClick={toggleTruncate}
        aria-expanded={!isTruncated}
        sx={{
          mt: 0.5, p: 0, border: 0, background: 'none', cursor: 'pointer',
          font: 'inherit', fontWeight: 600, fontSize: '0.85rem', color: 'primary.main',
        }}
      >
        {isTruncated ? 'Read more' : 'Show less'}
      </Box>
    </Box>
  );
}

export default OverflowText;
