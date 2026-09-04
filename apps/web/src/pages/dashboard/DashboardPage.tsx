import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  Minus,
  PiggyBank,
  Plus,
  Wallet,
} from 'lucide-react';

import { useAppSelector } from '../../store/hooks';
import { useCreateTransactionMutation } from '../../store/api/transactionsApi';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

const MotionCard = motion(Card);

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <MotionCard
      variants={cardVariants}
      whileHover={{
        y: -7,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      sx={{
        p: 3,
        borderRadius: 3,
        height: '100%',
        cursor: 'default',
        transition: 'box-shadow 0.25s ease',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        <motion.div
          whileHover={{
            rotate: 8,
            scale: 1.1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            {icon}
          </Box>
        </motion.div>
      </Box>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Typography>
    </MotionCard>
  );
}

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  const [createTransaction, { isLoading, error }] =
    useCreateTransactionMutation();

  const [openIncome, setOpenIncome] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Income');
  const [category, setCategory] = useState('Salary');

  const handleSaveIncome = async () => {
    const numericAmount = Number(amount);

    if (!accountId.trim()) return;
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;

    try {
      await createTransaction({
        accountId: accountId.trim(),
        amount: numericAmount,
        description: description.trim() || 'Income',
        category: category.trim() || 'Salary',
        date: new Date().toISOString().split('T')[0],
      }).unwrap();

      setAccountId('');
      setAmount('');
      setDescription('Income');
      setCategory('Salary');
      setOpenIncome(false);
    } catch (err) {
      console.error('Failed to save income:', err);
    }
  };

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        overflow: 'hidden',
      }}
    >
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              letterSpacing: '-0.03em',
            }}
          >
            Welcome back
            {user?.firstName ? `, ${user.firstName}` : ''}!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            Here's what's happening with your finances today.
          </Typography>
        </Box>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: 0.1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <SummaryCard
            title="Total Balance"
            value="PKR 0"
            icon={<Wallet size={22} />}
          />

          <SummaryCard
            title="Income"
            value="PKR 0"
            icon={<ArrowDownToLine size={22} />}
          />

          <SummaryCard
            title="Expenses"
            value="PKR 0"
            icon={<ArrowUpFromLine size={22} />}
          />

          <SummaryCard
            title="Savings"
            value="PKR 0"
            icon={<PiggyBank size={22} />}
          />
        </Box>
      </motion.div>

      {/* Main Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.5fr 1fr',
          },
          gap: 3,
        }}
      >
        {/* Recent Transactions */}
        <MotionCard
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.35,
          }}
          whileHover={{
            y: -4,
          }}
          sx={{
            p: 3,
            borderRadius: 3,
            minHeight: 300,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            Recent Transactions
          </Typography>

          <Box
            sx={{
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <motion.div
              animate={{
                y: [0, -7, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                }}
              >
                <Minus size={30} />
              </Box>
            </motion.div>

            <Typography
              variant="body1"
              sx={{
                mt: 2,
                fontWeight: 600,
              }}
            >
              No transactions yet
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: 'text.secondary',
              }}
            >
              Your recent transactions will appear here.
            </Typography>
          </Box>
        </MotionCard>

        {/* Quick Actions */}
        <MotionCard
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.45,
          }}
          whileHover={{
            y: -4,
          }}
          sx={{
            p: 3,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            Quick Actions
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => setOpenIncome(true)}
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Add Income
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowUpFromLine size={20} />}
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Add Expense
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowRightLeft size={20} />}
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Transfer
              </Button>
            </motion.div>
          </Box>
        </MotionCard>
      </Box>

      {/* Add Income Dialog */}
      <Dialog
        open={openIncome}
        onClose={() => {
          if (!isLoading) {
            setOpenIncome(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Add Income
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
              label="Account ID"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Enter your account UUID"
              disabled={isLoading}
              fullWidth
            />

            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              fullWidth
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              fullWidth
            />

            <TextField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              fullWidth
            />

            {error && (
              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                }}
              >
                Failed to save income. Please check your account ID
                and authentication.
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenIncome(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveIncome}
            disabled={
              isLoading ||
              !accountId.trim() ||
              !amount.trim()
            }
          >
            {isLoading ? 'Saving...' : 'Save Income'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}