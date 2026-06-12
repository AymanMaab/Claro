import { Box, Typography } from '@mui/material';

interface Props {
  page: string;
}

const ComingSoon = ({ page }: Props) => (
  <Box>
    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
      {page}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      This section is coming soon.
    </Typography>
  </Box>
);

export default ComingSoon;
