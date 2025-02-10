import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  _analyticTasks,
  _analyticPosts,
  _analyticTraffic,
  _analyticOrderTimeline,
} from 'src/_mock';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

export function OverviewAnalyticsView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        工作服销售仪表板 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Total Sales - 总销售额 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="总销售额"
            percent={2.6}
            total={714000}
            icon={
              <img alt="销售额" src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-bag.svg`} />
            }
            chart={{
              categories: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        {/* Disposable Suits Sales - 一次性防护服销量 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="一次性防护服销量"
            percent={5.2}
            total={23815}
            color="secondary"
            icon={
              <img alt="防护服" src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-users.svg`} />
            }
            chart={{
              categories: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid>

        {/* Coveralls Sales - 工作服销量 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="工作服销量"
            percent={2.8}
            total={18432}
            color="warning"
            icon={
              <img alt="工作服" src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-buy.svg`} />
            }
            chart={{
              categories: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        {/* New Orders - 新订单 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="新订单"
            percent={3.6}
            total={234}
            color="error"
            icon={
              <img alt="订单" src={`${CONFIG.assetsDir}/assets/icons/glass/ic-glass-cart.svg`} />
            }
            chart={{
              categories: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        {/* Sales by Region - 各地区销售分布 */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="各地区销售分布"
            chart={{
              series: [
                { label: '华北', value: 3500 },
                { label: '华东', value: 2500 },
                { label: '华南', value: 1500 },
                { label: '西部', value: 500 },
              ],
            }}
          />
        </Grid>

        {/* Monthly Sales Trend - 月度销售趋势 */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="月度销售趋势"
            subheader="较去年同期增长(+43%)"
            chart={{
              categories: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月'],
              series: [
                { name: '防护服', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: '工作服', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
            }}
          />
        </Grid>

        {/* Product Performance - 产品表现 */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="产品表现"
            subheader="较去年同期增长(+43%)"
            chart={{
              categories: ['一次性防护服', '连体工作服', '安全帽', '防护手套', '防护鞋'],
              series: [
                { name: '2022年', data: [44, 55, 41, 64, 22] },
                { name: '2023年', data: [53, 32, 33, 52, 13] },
              ],
            }}
          />
        </Grid>

        {/* Product Categories - 产品类别销售 */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="产品类别销售"
            chart={{
              categories: ['防护服', '工作服', '手套', '鞋类', '头部防护', '其他'],
              series: [
                { name: '销量', data: [80, 50, 30, 40, 100, 20] },
                { name: '目标', data: [20, 30, 40, 80, 20, 80] },
                { name: '增长', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid>

        {/* Sales News - 销售动态 */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsNews title="销售动态" list={_analyticPosts} />
        </Grid>

        {/* Order Timeline - 订单时间线 */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsOrderTimeline title="订单时间线" list={_analyticOrderTimeline} />
        </Grid>

        {/* Sales by Channel - 销售渠道分析 */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsTrafficBySite title="销售渠道分析" list={_analyticTraffic} />
        </Grid>

        {/* Sales Tasks - 销售任务 */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsTasks title="销售任务" list={_analyticTasks} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}