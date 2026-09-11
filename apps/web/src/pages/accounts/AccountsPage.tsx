import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  CreditCard,
  Landmark,
  Plus,
  Wallet,
} from 'lucide-react';

const MotionCard = motion(Card);

interface Account {
  id: number;
  bankName: string;
  accountName: string;
  type: 'Current' | 'Savings' | 'Credit';
  balance: number;
}

const AccountsPage = () => {
  const [open, setOpen] = useState(false);

  const [accounts] = useState<Account[]>([]);

  const formatBalance = (balance: number) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 2,
    }).format(balance);

  const getIcon = (type: Account['type']) => {
    if (type === 'Credit') {
      return <CreditCard size={24} />;
    }

    if (type === 'Savings') {
      return <Wallet size={24} />;
    }

    return <Landmark size={24} />;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                letterSpacing: '-0.03em',
              }}
            >
              Accounts
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: 'text.secondary' }}
            >
              Manage your bank accounts and balances.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1.25,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Account
          </Button>
        </Box>
      </motion.div>

      {/* Accounts */}
      {accounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card
            sx={{
              minHeight: 360,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Landmark size={32} />
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                No accounts yet
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                }}
              >
                Add your first bank account to start managing
                your finances.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => setOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Add Your First Account
              </Button>
            </Box>
          </Card>
        </motion.div>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {accounts.map((account, index) => (
            <MotionCard
              key={account.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
              whileHover={{
                y: -7,
                scale: 1.02,
              }}
              sx={{
                p: 3,
                borderRadius: 3,
                cursor: 'default',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getIcon(account.type)}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {account.type}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                {account.bankName}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                {account.accountName}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 0.5,
                }}
              >
                Balance
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                {formatBalance(account.balance)}
              </Typography>
            </MotionCard>
          ))}
        </Box>
      )}

      {/* Add Account Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Add Account
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              label="Bank Name"
              placeholder="e.g. HBL"
              fullWidth
            />

            <TextField
              label="Account Name"
              placeholder="e.g. Main Account"
              fullWidth
            />

            <TextField
              select
              label="Account Type"
              defaultValue="Current"
              fullWidth
            >
              <MenuItem value="Current">Current</MenuItem>
              <MenuItem value="Savings">Savings</MenuItem>
              <MenuItem value="Credit">Credit</MenuItem>
            </TextField>

            <TextField
              label="Initial Balance"
              type="number"
              placeholder="0"
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => setOpen(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountsPage;