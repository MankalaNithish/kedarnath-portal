import Head from 'next/head';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Layout from '@/components/layout';
import { useAnimation, fadeInUp, useStagger } from '@/components/motion';

export default function About() {
  const item = useAnimation(fadeInUp);
  const group = useStagger(0.07);

  return (
    <Layout>
      <Head>
        <title>About &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
        <meta
          name="description"
          content="About the Kedarnath annadanam camp run by Kedarnath Annadana Seva Samithi, Siddipet."
        />
      </Head>

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 9 } }}>
        <motion.div variants={group} initial="hidden" animate="show">
          <motion.div variants={item}>
            <Typography variant="h1" component="h1">About the seva</Typography>
          </motion.div>

          {/* Prose preserved verbatim from the original page. */}
          <motion.div variants={item}>
            <Typography
              variant="body1"
              sx={{ mt: 5, maxWidth: '68ch', fontSize: '1.12rem', lineHeight: 1.85 }}
            >
              The most glorious of the world-renowned pilgrimages is the most difficult of all.
              Kedhariswaram is the most famous Mahayatra shrine among the Dwadasha Jyotirlingas.  During the Jyotirlinga Mahadarshan Yatra, lakhs of people from many countries, states, districts, towns and villages come and go to visit this place of pilgrimage.  God, Mahadev, who is called upon to protect all living beings, to bless devotees for the welfare of the world in the form of the creator of creation, the chief of wealth, the savior, the Mahalinga.  Kedharinath, the holy place where Lord Shiva appeared, is the best place for spiritual contemplation, meditation and meditation. For the convenience of the devotees of Kedarnath Yatra, Annadanam is a great gift.
            </Typography>
          </motion.div>

          <motion.div variants={item}>
            <Box
              sx={{
                my: 5, pl: { xs: 2.5, md: 4 },
                borderLeft: theme => `2px solid ${theme.palette.primary.main}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: theme => theme.typography.h1.fontFamily,
                  fontSize: { xs: '1.3rem', md: '1.6rem' }, lineHeight: 1.45, maxWidth: '34ch',
                }}
              >
                There is no other great gift beyond food in this Kali Yuga.
              </Typography>
            </Box>
          </motion.div>

          <motion.div variants={item}>
            <Typography variant="body1" sx={{ maxWidth: '68ch', fontSize: '1.12rem', lineHeight: 1.85 }}>
              As the only Telugu food donation camp in Telangana state in South India, we are conducting it under the joint auspices of Shri Kedharnath Langar Committee Jalandhar and Kedharnath Annadana Seva Samiti, Siddipet.  It is no exaggeration to say that the definition of satisfaction is food, and there is no other great gift beyond food in this Kali Yuga.  We have started this holy program considering the preservation of all the crores of people as human service as Mahesh&apos;s service as Kedareshwar&apos;s service.  Annadanam is an easy time for salvation for devotees to take human birth.  All the devotees receive Annaprasad in the presence of Lord Kedareshwar and after seeing the happiness they get, they get the full grace of Lord Shiva.  We sincerely invite every devotee to participate in this holy food donation program with their own devotion to this huge holy food donation camp.
            </Typography>
          </motion.div>
        </motion.div>
      </Container>
    </Layout>
  );
}
