import * as React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  Box, Chip, Container, InputAdornment, Stack, TextField, Typography,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import Layout from '@/components/layout';
import MemberContact from '@/components/member-contact';
import EmptyState from '@/components/EmptyState';
import { useAnimation, fadeInUp, useStagger } from '@/components/motion';
import totalMembers from '@/pages/data/members.json';

const { honMems, mainMems, commiteeMems, members } = totalMembers;

// Same four tiers, same order, same source arrays as before.
// Phone numbers are shown only for Main Body and Committee Members — the
// people the public is meant to contact. The numbers stay in members.json
// for every tier; they are simply not rendered for the other two.
const sections = [
  { key: 'hon', heading: "Hon'ble Members", list: honMems, showPhone: false },
  { key: 'main', heading: 'Main Body', list: mainMems, showPhone: true },
  { key: 'committee', heading: 'Committee Members', list: commiteeMems, showPhone: true },
  { key: 'members', heading: 'Members', list: members, showPhone: false },
];

const TOTAL = sections.reduce((n, s) => n + s.list.length, 0);

const matches = (member, q) =>
  [member.name, member.designation, member.place]
    .filter(Boolean)
    .some(field => field.toLowerCase().includes(q));

function Section({ heading, list, showPhone }) {
  const item = useAnimation(fadeInUp);
  const group = useStagger(0.025);

  if (!list.length) return null;

  return (
    <Box component="section" sx={{ mb: { xs: 5, md: 7 } }}>
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        sx={{
          position: 'sticky', top: { xs: 60, md: 64 }, zIndex: 2,
          py: 1.5, mb: 2.5,
          backgroundColor: 'background.default',
          borderBottom: theme => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
          {heading}
        </Typography>
        <Typography variant="caption">{list.length}</Typography>
      </Stack>

      <motion.div variants={group} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
        <Box
          sx={{
            display: 'grid', gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {list.map((mem, index) => (
            <motion.div key={`${mem.name}-${index}`} variants={item} style={{ height: '100%' }}>
              <MemberContact member={mem} avatar showPhone={showPhone} />
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}

export default function Members() {
  const [query, setQuery] = React.useState('');
  const q = query.trim().toLowerCase();

  // With an empty query every section returns its full list, so all members
  // render on load. Filtering is purely additive.
  const visible = React.useMemo(
    () => sections.map(s => ({ ...s, list: q ? s.list.filter(m => matches(m, q)) : s.list })),
    [q],
  );

  const shown = visible.reduce((n, s) => n + s.list.length, 0);

  return (
    <Layout>
      <Head>
        <title>Members &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
        <meta name="description" content="Office bearers, committee and members of Kedarnath Annadana Seva Samithi, Siddipet." />
      </Head>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Typography variant="h1" component="h1">Members</Typography>
        <Typography variant="subtitle1" sx={{ mt: 2, maxWidth: '54ch' }}>
          Kedarnath Annadana Seva Samithi, Siddipet &middot; Regd. No. 4/2020
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'center' }}
          sx={{ mt: 4, mb: 5 }}
        >
          <TextField
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, role or place"
            aria-label="Search members by name, role or place"
            fullWidth
            sx={{ maxWidth: { sm: 420 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <Box
                    component="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    sx={{
                      display: 'flex', alignItems: 'center', border: 0, background: 'none',
                      cursor: 'pointer', color: 'text.secondary', p: 0.5,
                    }}
                  >
                    <ClearOutlined fontSize="small" />
                  </Box>
                </InputAdornment>
              ) : null,
            }}
          />
          <Chip
            variant="outlined"
            label={q ? `${shown} of ${TOTAL}` : `${TOTAL} people`}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          />
        </Stack>

        {shown === 0 ? (
          <EmptyState
            icon={<SearchOutlined />}
            title="No one matches that search"
            description={`Nothing found for "${query}". Try a different name, role or place.`}
          />
        ) : (
          visible.map(s => (
            <Section key={s.key} heading={s.heading} list={s.list} showPhone={s.showPhone} />
          ))
        )}
      </Container>
    </Layout>
  );
}
