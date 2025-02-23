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
import Typography from '@mui/material/Typography';

export function AnalyticsTasks({ 
  title = "Текущие задачи",
  subheader = "План на сегодня",
  list = [],
  sx,
  ...other 
}) {
  const [selected, setSelected] = useState([]);

  const handleToggleTask = (taskId) => {
    const newSelected = selected.includes(taskId) 
      ? selected.filter(id => id !== taskId)
      : [...selected, taskId];
    setSelected(newSelected);
  };

  return (
    <Card sx={sx} {...other}>
      <CardHeader 
        title={title} 
        subheader={subheader}
      />

      <Scrollbar>
        <MenuList  disablePadding>
          {list.map((task) => (
            <MenuItem
              key={task.id}
              disableGutters
              sx={{
                px: 3,
                py: 1.5,
                display: 'flex', 
                alignItems: 'center',
                ...(selected.includes(task.id) && {
                  color: 'text.disabled',
                  textDecoration: 'line-through'
                })
              }}
            >
              <Checkbox
                checked={selected.includes(task.id)}
                onChange={() => handleToggleTask(task.id)}
              />
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">
                  {task.title}
                </Typography>
                <Typography 
                  variant="caption"
                  color="text.secondary"
                >
                  Срок: {task.deadline}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </MenuList >
      </Scrollbar>
    </Card>
  );
}