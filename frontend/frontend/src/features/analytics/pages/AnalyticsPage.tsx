

import '../components/DailySnapshot.css';
import '../components/Trend.css';
import '../components/DayOverDay.css';
import '../components/Range.css';
import '../components/TopProducts.css';
import '../components/OrderStatus.css';
import '../components/CustomerInsights.css';
import '../components/ExportAnalytics.css';
import '../components/Forecast.css';
import '../components/Anomalies.css';

import '../../mobileResponsive.css';
import './AnalyticsPage.css';
import { DailySnapshot } from '../components/DailySnapshot';
import { Trend } from '../components/Trend';
import { DayOverDay } from '../components/DayOverDay';
import { Range } from '../components/Range';
import { TopProducts } from '../components/TopProducts';
import { OrderStatus } from '../components/OrderStatus';
import { CustomerInsights } from '../components/CustomerInsights';
import { ExportAnalytics } from '../components/ExportAnalytics';
import { Forecast } from '../components/Forecast';
import { Anomalies } from '../components/Anomalies';

export function AnalyticsPage() {
	return (
		<div className="analytics-page">
			<header className="analytics-header">
				<h1 className="analytics-page-title">Store Analytics Dashboard</h1>
			</header>
			<main className="analytics-container">
				<DailySnapshot />
				<Trend />
				<DayOverDay />
				<Range />
				<TopProducts />
				<OrderStatus />
				<CustomerInsights />
				<ExportAnalytics />
				<Forecast />
				<Anomalies />
			</main>
		</div>
	);
}
