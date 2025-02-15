// Tasks Component - 任务组件
import { useState } from 'react';
import { usePopover } from 'minimal-shared/hooks';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomPopover } from 'src/components/custom-popover';

export function AnalyticsTasks({ title, subheader, list, sx, ...other }) {
  const [selected, setSelected] = useState(['2']);

  const handleClickComplete = (taskId) => {
    const tasksCompleted = selected.includes(taskId)
      ? selected.filter((value) => value !== taskId)
      : [...selected, taskId];
    setSelected(tasksCompleted);
  };

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 1 }} />
      <Scrollbar sx={{ minHeight: 304 }}>
        <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />} sx={{ minWidth: 560 }}>
          {list.map((item) => (
            <TaskItem
              key={item.id}
              item={item}
              selected={selected.includes(item.id)}
              onChange={() => handleClickComplete(item.id)}
            />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

function TaskItem({ item, selected, onChange, sx, ...other }) {
  const menuActions = usePopover();

  const actions = {
    complete: () => {
      menuActions.onClose();
      console.info('完成任务', item.id);
    },
    share: () => {
      menuActions.onClose();
      console.info('分享', item.id);
    },
    edit: () => {
      menuActions.onClose();
      console.info('编辑', item.id);
    },
    delete: () => {
      menuActions.onClose();
      console.info('删除', item.id);
    },
  };

  return (
    <>
      <Box
        sx={[
          {
            pl: 2,
            pr: 1,
            py: 1.5,
            display: 'flex',
            ...(selected && {
              color: 'text.disabled',
              textDecoration: 'line-through',
            }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <FormControlLabel
          label={item.name}
          control={
            <Checkbox
              disableRipple
              checked={selected}
              onChange={onChange}
              inputProps={{ id: `${item.name}-checkbox` }}
            />
          }
          sx={{ flexGrow: 1, m: 0 }}
        />

        <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Box>

      <CustomPopover
        open={menuActions.open}
        anchorEl={menuActions.anchorEl}
        onClose={menuActions.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={actions.complete}>
            <Iconify icon="eva:checkmark-circle-2-fill" />
            标记完成
          </MenuItem>

          <MenuItem onClick={actions.edit}>
            <Iconify icon="solar:pen-bold" />
            编辑
          </MenuItem>

          <MenuItem onClick={actions.share}>
            <Iconify icon="solar:share-bold" />
            分享
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem onClick={actions.delete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            删除
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
