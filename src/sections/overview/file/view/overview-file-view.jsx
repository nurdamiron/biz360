import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { _files, _folders } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';

import { FileWidget } from '../../../file-manager/file-widget';
import { FileUpgrade } from '../../../file-manager/file-upgrade';
import { FileRecentItem } from '../../../file-manager/file-recent-item';
import { FileDataActivity } from '../../../file-manager/file-data-activity';
import { FileManagerPanel } from '../../../file-manager/file-manager-panel';
import { FileStorageOverview } from '../../../file-manager/file-storage-overview';
import { FileManagerFolderItem } from '../../../file-manager/file-manager-folder-item';
import { FileManagerNewFolderDialog } from '../../../file-manager/file-manager-new-folder-dialog';

// ----------------------------------------------------------------------

const GB = 1000000000 * 24;

// ----------------------------------------------------------------------

export function OverviewFileView() {
  const [folderName, setFolderName] = useState('');

  const [files, setFiles] = useState([]);

  const newFilesDialog = useBoolean();
  const newFolderDialog = useBoolean();

  const handleChangeFolderName = useCallback((event) => {
    setFolderName(event.target.value);
  }, []);

  const handleCreateNewFolder = useCallback(() => {
    newFolderDialog.onFalse();
    setFolderName('');
    console.info('CREATE NEW FOLDER');
  }, [newFolderDialog]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files]
  );

  const renderStorageOverview = () => (
    <FileStorageOverview
  sx={{ maxWidth: 400 }}
  chart={{
    series: 78, // 76% общая эффективность
  }}
  data={[
    {
      name: 'Продажи',
      icon: <Iconify icon="eva:shopping-cart-fill" />,
      value: 24, // 24% вклада
      subtitle: 'Средний чек: 45k', // Доп. инфо
    },
    {
      name: 'Продукт',
      icon: <Iconify icon="eva:briefcase-fill" />,
      value: 32,
      subtitle: 'Качество: 95%',
    },
    {
      name: 'Учёт',
      icon: <Iconify icon="eva:file-text-fill" />,
      value: 20,
      subtitle: 'Ошибок: 2%',
    },
  ]}
/>

  );

  const renderNewFilesDialog = () => (
    <FileManagerNewFolderDialog open={newFilesDialog.value} onClose={newFilesDialog.onFalse} />
  );

  const renderNewFolderDialog = () => (
    <FileManagerNewFolderDialog
      open={newFolderDialog.value}
      onClose={newFolderDialog.onFalse}
      title="New Folder"
      folderName={folderName}
      onChangeFolderName={handleChangeFolderName}
      onCreate={handleCreateNewFolder}
    />
  );

  return (
    <>
      <DashboardContent maxWidth="xl">
        <Grid container spacing={3}>
          {/* <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }} >
            Добро пожаловать в BIZ360 👋
          </Typography> */}
          <Grid sx={{ display: { xs: '12', sm: '6' } }} size={18} >
            {renderStorageOverview()}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FileWidget
            icon={`${CONFIG.assetsDir}/assets/icons/navbar/ic-analytics.svg`}
            title="Продажи"
            manager="Жанат Кульбаева"
            managerIcon="eva:person-fill"
            value={93}
            total={100}
            showAsPercent
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FileWidget
            icon={`${CONFIG.assetsDir}/assets/icons/navbar/ic-product.svg`}
            title="Продукт"
            manager="Амантаева Ляззат"
            managerIcon="eva:person-fill"
            value={92}
            total={100}
            showAsPercent
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FileWidget
            icon={`${CONFIG.assetsDir}/assets/icons/navbar/ic-invoice.svg`}
            title="Учет"
            manager="Әлемгер"
            managerIcon="eva:person-fill"
            value={90}
            total={100}
            showAsPercent
            />
          </Grid>

          {/* <Grid size={{ xs: 12, md: 6, lg: 8 }}>
            <FileDataActivity
              title="Data activity"
              chart={{
                series: [
                  {
                    name: 'Weekly',
                    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                    data: [
                      { name: 'Images', data: [20, 34, 48, 65, 37] },
                      { name: 'Media', data: [10, 34, 13, 26, 27] },
                      { name: 'Documents', data: [10, 14, 13, 16, 17] },
                      { name: 'Other', data: [5, 12, 6, 7, 8] },
                    ],
                  },
                  {
                    name: 'Monthly',
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    data: [
                      { name: 'Images', data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 12, 43, 34] },
                      { name: 'Media', data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 12, 43, 34] },
                      { name: 'Documents', data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 12, 43, 34] },
                      { name: 'Other', data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 12, 43, 34] },
                    ],
                  },
                  {
                    name: 'Yearly',
                    categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
                    data: [
                      { name: 'Images', data: [24, 34, 32, 56, 77, 48] },
                      { name: 'Media', data: [24, 34, 32, 56, 77, 48] },
                      { name: 'Documents', data: [24, 34, 32, 56, 77, 48] },
                      { name: 'Other', data: [24, 34, 32, 56, 77, 48] },
                    ],
                  },
                ],
              }}
            />

            <Box sx={{ mt: 5 }}>
              <FileManagerPanel
                title="Folders"
                link={paths.dashboard.fileManager}
                onOpen={newFolderDialog.onTrue}
              />

              <Scrollbar sx={{ mb: 3, minHeight: 186 }}>
                <Box sx={{ gap: 3, display: 'flex' }}>
                  {_folders.map((folder) => (
                    <FileManagerFolderItem
                      key={folder.id}
                      folder={folder}
                      onDelete={() => console.info('DELETE', folder.id)}
                      sx={{
                        ...(_folders.length > 3 && {
                          width: 240,
                          flexShrink: 0,
                        }),
                      }}
                    />
                  ))}
                </Box>
              </Scrollbar>

              <FileManagerPanel
                title="Recent files"
                link={paths.dashboard.fileManager}
                onOpen={newFilesDialog.onTrue}
              />

              <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
                {_files.slice(0, 5).map((file) => (
                  <FileRecentItem
                    key={file.id}
                    file={file}
                    onDelete={() => console.info('DELETE', file.id)}
                  />
                ))}
              </Box>
            </Box>
          </Grid> */}

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            {/* <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
              <UploadBox
                onDrop={handleDrop}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload file</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: 'auto',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />


              <FileUpgrade />
            </Box> */}
          </Grid>
        </Grid>
      </DashboardContent>

      {renderNewFilesDialog()}
      {renderNewFolderDialog()}
    </>
  );
}
