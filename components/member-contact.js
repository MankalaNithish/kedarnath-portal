import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';

/** Two strongest letters of the name, for members with no photograph on file. */
function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(p => !/^(sri|smt|dr|shri)\.?$/i.test(p));
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

/**
 * `showPhone` controls only whether the number is rendered. The value itself is
 * left untouched on the member object.
 */
export default function MemberContact({ member, avatar, showPhone = true }) {
  return (
    <Box
      sx={{
        height: '100%', display: 'flex', gap: 2, p: 2.25, borderRadius: 3,
        backgroundColor: 'background.paper',
        border: theme => `1px solid ${theme.palette.divider}`,
        transition: 'border-color .18s, box-shadow .18s',
        '&:hover': {
          borderColor: theme => theme.palette.surface.borderStrong,
          boxShadow: theme => theme.shadows[2],
        },
      }}
    >
      {avatar && (
        <Avatar
          src={member.picName ? `/profiles/${member.picName}.jpg` : undefined}
          alt=""
          sx={{ width: 52, height: 52, flexShrink: 0, fontSize: '0.95rem' }}
        >
          {initials(member.name)}
        </Avatar>
      )}

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontFamily: theme => theme.typography.h1.fontFamily,
            fontSize: '1.05rem', lineHeight: 1.3,
          }}
        >
          {member.name}
        </Typography>

        {member.designation && (
          <Chip
            label={member.designation}
            size="small"
            sx={{
              mt: 1, maxWidth: '100%', height: 'auto', py: 0.4,
              backgroundColor: theme => theme.palette.surface.secondarySoft,
              color: 'secondary.main',
              '& .MuiChip-label': { whiteSpace: 'normal', fontSize: '0.76rem', lineHeight: 1.4 },
            }}
          />
        )}

        <Stack spacing={0.5} sx={{ mt: 1.5 }}>
          {/* Was plain text; now dials directly on a phone. */}
          {showPhone && member.phone && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <CallOutlined sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography
                component="a"
                href={`tel:${String(member.phone).replace(/\s+/g, '')}`}
                variant="body2"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                {member.phone}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" spacing={0.75} alignItems="center">
            <PlaceOutlined sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{member.place}</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
