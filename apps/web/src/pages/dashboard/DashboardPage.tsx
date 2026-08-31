import { Box, Card, Typography } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import type { ReactNode } from 'react';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
}

const SummaryCard = ({
  title,
  value,
  icon,
  description,
}: SummaryCardProps) => {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: 2,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .summary-icon': {
            transform: 'scale(1.1)',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          className="summary-icon"
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: 'primary.light',
            transition: 'transform 0.2s ease',
          }}
        >
          {icon}
        </Box>

        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>

      <Typography
        variant="h5"
        sx={{
          mt: 2,
          fontWeight: 700,
          textAlign: 'left',
        }}
      >
        {value}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mt: 0.5,
          textAlign: 'left',
        }}
      >
        {description}
      </Typography>
    </Card>
  );
};

const DashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h4">
        Welcome back, {user?.firstName}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Here's an overview of your finances.
      </Typography>

      <Box
        sx={{
          mt: 4,
          mx: 'auto',
          width: '100%',
          maxWidth: 1000,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        <SummaryCard
          title="Total Balance"
          value="PKR 0"
          icon={<Wallet size={24} />}
          description="Across all accounts"
        />

        <SummaryCard
          title="Income"
          value="PKR 0"
          icon={<ArrowDownToLine size={24} />}
          description="This month"
        />

        <SummaryCard
          title="Expenses"
          value="PKR 0"
          icon={<ArrowUpFromLine size={24} />}
          description="This month"
        />

        <SummaryCard
          title="Savings"
          value="PKR 0"
          icon={<PiggyBank size={24} />}
          description="This month"
        />
      </Box>

      <Box
        sx={{
          mt: 4,
          textAlign: 'left',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Recent Transactions
        </Typography>
        <Card
        sx={{
          mt:2,
          p:3,
          borderRadius:3,
          boxShadow:2,
        }}
        >
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;