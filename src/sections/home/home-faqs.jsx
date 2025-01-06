import { useState } from 'react';
import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion, { accordionClasses } from '@mui/material/Accordion';
import AccordionDetails, { accordionDetailsClasses } from '@mui/material/AccordionDetails';
import AccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';
import { paths } from 'src/routes/paths';

import { SectionTitle } from './components/section-title';
import { FloatLine, FloatPlusIcon, FloatTriangleDownIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

const FAQs = [
  {
    question: 'Как начать использовать Biz360?',
    answer: (
      <Typography>
        Начать работу с Biz360 просто:
        <Link
          href={paths.auth.supabase.signUp}
          target="_blank"
          rel="noopener"
          sx={{ mx: 0.5 }}
        >
          зарегистрируйтесь на платформе
        </Link>
        загрузите данные вашего бизнеса через удобный интерфейс или интегрируйте существующие системы. Наши специалисты помогут с настройкой и проведут обучение вашей команды.
      </Typography>
    ),
  },
  {
    question: 'Какие данные анализирует система?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li> Финансовые показатели (выручка, расходы, прибыль)</li>
        <li> Операционные метрики (продажи, конверсии, эффективность сотрудников)</li>
        <li>Клиентские данные (поведение, удовлетворенность, LTV)</li>
        <li>Производственные процессы (загрузка мощностей, простои, брак)</li>
        <li>Маркетинговые показатели (ROI рекламных кампаний, стоимость привлечения)</li>
        {/* <li>
          Learn more about the
          <Link
            href="https://docs.minimals.cc/package/"
            target="_blank"
            rel="noopener"
            sx={{ mx: 0.5 }}
          >
            package & license
          </Link>
        </li> */}
      </Box>
    ),
  },
  {
    question: 'Насколько безопасно хранение данных?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li> Шифрование данных по стандарту AES-256</li>
        <li> Ежедневное резервное копирование</li>
        <li> Доступ только для авторизованных пользователей с двухфакторной аутентификацией</li>
      </Box>
    ),
  },
  {
    question: 'Возможна ли интеграция с моими текущими системами?',
    answer: (
      <Typography>
        {`Да, Biz360 легко интегрируется с популярными системами: `}
        <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li> 1С</li>
        <li> CRM-системы (Bitrix24, amoCRM)</li>
        <li> Системы учета и ERP</li>
        <li> Онлайн-кассы  </li>
        <li> Excel/Google Таблицы.</li>
      </Box>При необходимости мы можем разработать индивидуальное решение для интеграции.
      </Typography>
      
    ),
  },
  {
    question: 'Как быстро я увижу результаты?',
    answer: (
      <Typography>
         Первые аналитические данные доступны сразу после загрузки информации. 
         Базовые рекомендации по оптимизации вы получите в течение первой недели использования. 
         Заметные улучшения в бизнес-процессах наши клиенты отмечают уже через 1-2 месяца активного использования платформы.
      </Typography>
    ),
  },
  {
    question: 'Предоставляете ли вы обучение?',
    answer: (
      <Typography>
        Мы обеспечиваем полную поддержку на всех этапах:
        <li>Бесплатное начальное обучение для всей команды</li>
        <li>Библиотека обучающих материалов и видеоуроков</li>
        <li>Регулярные вебинары по новым функциям</li>
        <li>Персональный менеджер для корпоративных клиентов</li>
        <li>Техническая поддержка 24/7</li>
      </Typography>
    ),
  },
  {
    question: 'Есть ли тестовый период?',
    answer: (
      <Typography>
        Да, мы предоставляем бесплатный 14-дневный тестовый период со всеми функциями системы. За это время вы сможете:
        <li>Загрузить свои данные</li>
        <li>Получить первичный анализ</li>
        <li>Опробовать все инструменты</li>
        <li>Оценить эффективность платформы для вашего бизнеса</li>
      </Typography>
    ),
  },
];

// ----------------------------------------------------------------------

export function HomeFAQs({ sx, ...other }) {
  const [expanded, setExpanded] = useState(FAQs[0].question);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const renderDescription = () => (
    <SectionTitle
      caption="Часто задаваемые вопросы"
      title="У нас есть "
      txtGradient="ответы"
      sx={{ textAlign: 'center' }}
    />
  );

  const renderContent = () => (
    <Stack
      spacing={1}
      sx={[
        () => ({
          mt: 8,
          mx: 'auto',
          maxWidth: 720,
          mb: { xs: 5, md: 8 },
        }),
      ]}
    >
      {FAQs.map((item, index) => (
        <Accordion
          key={item.question}
          component={m.div}
          variants={varFade('inUp', { distance: 24 })}
          expanded={expanded === item.question}
          onChange={handleChange(item.question)}
          sx={(theme) => ({
            borderRadius: 2,
            transition: theme.transitions.create(['background-color'], {
              duration: theme.transitions.duration.short,
            }),
            '&::before': { display: 'none' },
            '&:hover': { bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.16) },
            '&:first-of-type, &:last-of-type': { borderRadius: 2 },
            [`&.${accordionClasses.expanded}`]: {
              m: 0,
              borderRadius: 2,
              boxShadow: 'none',
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            },
            [`& .${accordionSummaryClasses.root}`]: {
              py: 3,
              px: 2.5,
              minHeight: 'auto',
              [`& .${accordionSummaryClasses.content}`]: {
                m: 0,
                [`&.${accordionSummaryClasses.expanded}`]: { m: 0 },
              },
            },
            [`& .${accordionDetailsClasses.root}`]: { px: 2.5, pt: 0, pb: 3 },
          })}
        >
          <AccordionSummary
            expandIcon={
              <Iconify
                width={20}
                icon={expanded === item.question ? 'mingcute:minimize-line' : 'mingcute:add-line'}
              />
            }
            aria-controls={`panel${index}bh-content`}
            id={`panel${index}bh-header`}
          >
            <Typography variant="h6"> {item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>{item.answer}</AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );

  const renderContact = () => (
    <Box
      sx={[
        (theme) => ({
          px: 3,
          py: 8,
          textAlign: 'center',
          background: `linear-gradient(to left, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}, transparent)`,
        }),
      ]}
    >
      <m.div variants={varFade('in')}>
        <Typography variant="h4">У вас все еще есть вопросы?</Typography>
      </m.div>

      <m.div variants={varFade('in')}>
        <Typography sx={{ mt: 2, mb: 3, color: 'text.secondary' }}>
        Пожалуйста, опишите свой случай, чтобы получить наиболее точную консультацию
        </Typography>
      </m.div>

      <m.div variants={varFade('in')}>
        <Button
          color="inherit"
          variant="contained"
          href="mailto:nurdamiron@gmail.com?subject=[Feedback] from Customer"
          startIcon={<Iconify icon="fluent:mail-24-filled" />}
        >
          Связаться
        </Button>
      </m.div>
    </Box>
  );

  return (
    <Box component="section" sx={sx} {...other}>
      <MotionViewport sx={{ py: 10, position: 'relative' }}>
        {topLines()}

        <Container>
          {renderDescription()}
          {renderContent()}
        </Container>

        <Stack sx={{ position: 'relative' }}>
          {bottomLines()}
          {renderContact()}
        </Stack>
      </MotionViewport>
    </Box>
  );
}

// ----------------------------------------------------------------------

const topLines = () => (
  <>
    <Stack
      spacing={8}
      alignItems="center"
      sx={{
        top: 64,
        left: 80,
        position: 'absolute',
        transform: 'translateX(-50%)',
      }}
    >
      <FloatTriangleDownIcon sx={{ position: 'static', opacity: 0.12 }} />
      <FloatTriangleDownIcon
        sx={{
          width: 30,
          height: 15,
          opacity: 0.24,
          position: 'static',
        }}
      />
    </Stack>

    <FloatLine vertical sx={{ top: 0, left: 80 }} />
  </>
);

const bottomLines = () => (
  <>
    <FloatLine sx={{ top: 0, left: 0 }} />
    <FloatLine sx={{ bottom: 0, left: 0 }} />
    <FloatPlusIcon sx={{ top: -8, left: 72 }} />
    <FloatPlusIcon sx={{ bottom: -8, left: 72 }} />
  </>
);
