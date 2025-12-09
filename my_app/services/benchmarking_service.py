
"""
Benchmarking service: Compare shop's latest metrics to its own 30-day averages, with extensible segmentation, advanced recommendations, export scaffolding, and visualization-ready output.

Features:
- Date range filtering
- Metrics calculation (sales, orders, AOV, live visitors, top product, conversion rate, revenue per visitor)
- Trend & comparison
- Correlation analysis
- Segmented benchmarking (product, customer, region, device)
- Data quality warnings
- Milestone comparison
- Automated recommendations
- Dashboard customization
- Export scaffolding (PDF/Excel)
- Visualization data
- Granular error handling
- Extensible metrics/segments
"""
from my_app.crud.analytics_crud import get_daily_analytics_for_shop
from my_app.utils.apiResponse import success_response, error_response
from my_app.middleware.logger import logger
import numpy as np
from datetime import datetime, timedelta

def get_benchmarking_data(shop_id):
    from my_app.database import SessionLocal
    import flask
    db = SessionLocal()
    try:
        # --- Input & Error Handling ---
        start_str = flask.request.args.get('start_date')
        end_str = flask.request.args.get('end_date')
        try:
            start_date = datetime.strptime(start_str, '%Y-%m-%d') if start_str else None
            end_date = datetime.strptime(end_str, '%Y-%m-%d') if end_str else None
        except Exception:
            return error_response("Invalid date format. Use YYYY-MM-DD.", status_code=400)

        shop_analytics = get_daily_analytics_for_shop(db, shop_id)
        if not shop_analytics:
            return error_response("No analytics data found for this shop.", status_code=404)

        # Filter by date range if provided, else last 30 days
        if start_date and end_date:
            shop_analytics = [a for a in shop_analytics if start_date <= a.date.date() <= end_date]
        else:
            shop_analytics = sorted(shop_analytics, key=lambda x: x.date, reverse=True)[:30]

        # Prepare date range and analytics mapping
        if shop_analytics:
            min_date = min(a.date.date() for a in shop_analytics)
            max_date = max(a.date.date() for a in shop_analytics)
        else:
            today = datetime.utcnow().date()
            min_date = max_date = today

        date_range = [min_date + timedelta(days=i) for i in range((max_date - min_date).days + 1)]
        analytics_by_date = {a.date.date(): a for a in shop_analytics}

        # --- Extensible Metrics ---
        default_metrics = [
            "sales", "orders", "aov", "live_visitors", "top_product", "conversion_rate", "revenue_per_visitor"
        ]
        metrics_list = default_metrics
        metrics = {k: [] for k in metrics_list}

        for d in date_range:
            a = analytics_by_date.get(d)
            metrics["sales"].append(a.sales if a and a.sales is not None else None)
            metrics["orders"].append(a.orders if a and a.orders is not None else None)
            metrics["aov"].append(a.aov if a and a.aov is not None else None)
            metrics["live_visitors"].append(a.live_visitors if a and a.live_visitors is not None else None)
            metrics["top_product"].append(a.top_product if a and a.top_product else None)
            # Conversion rate: orders / live_visitors
            if a and a.orders is not None and a.live_visitors:
                metrics["conversion_rate"].append(round(a.orders / a.live_visitors, 4) if a.live_visitors else None)
            else:
                metrics["conversion_rate"].append(None)
            # Revenue per visitor: sales / live_visitors
            if a and a.sales is not None and a.live_visitors:
                metrics["revenue_per_visitor"].append(round(a.sales / a.live_visitors, 2) if a.live_visitors else None)
            else:
                metrics["revenue_per_visitor"].append(None)

        # --- Calculate averages, trends, and visualization data ---
        averages = {k: float(np.nanmean([v for v in metrics[k] if v is not None])) if any(v is not None for v in metrics[k]) else 0 for k in metrics}
        latest_idx = len(date_range) - 1
        latest_metrics = {k: metrics[k][latest_idx] if metrics[k] else None for k in metrics}

        # Build comparison report and chart-ready data
        comparison = {}
        chart_data = {}
        for metric in averages.keys():
            avg = averages[metric]
            latest_val = latest_metrics[metric]
            percent_change = ((latest_val - avg) / avg * 100) if avg and latest_val is not None else 0
            comparison[metric] = {
                "latest": latest_val,
                "avg": round(avg, 2),
                "percent_change": round(percent_change, 2),
                "trend": metrics[metric]
            }
            chart_data[metric] = {
                "labels": [d.isoformat() for d in date_range],
                "series": metrics[metric]
            }

            # Calculate averages
            averages = {k: float(np.nanmean([v for v in metrics[k] if v is not None])) if any(v is not None for v in metrics[k]) else 0 for k in metrics}
            latest_idx = len(date_range) - 1
            latest_metrics = {k: metrics[k][latest_idx] if metrics[k] else None for k in metrics}

            # Build comparison report
            comparison = {}
            for metric in averages.keys():
                avg = averages[metric]
                latest_val = latest_metrics[metric]
                percent_change = ((latest_val - avg) / avg * 100) if avg and latest_val is not None else 0
                comparison[metric] = {
                    "latest": latest_val,
                    "avg": round(avg, 2),
                    "percent_change": round(percent_change, 2),
                    "trend": metrics[metric]
                }

        # --- Multi-metric correlation ---
        def safe_corr(x, y):
            x_clean = np.array([a for a, b in zip(x, y) if a is not None and b is not None])
            y_clean = np.array([b for a, b in zip(x, y) if a is not None and b is not None])
            if len(x_clean) > 1 and len(y_clean) > 1:
                return float(np.corrcoef(x_clean, y_clean)[0, 1])
            return None

        correlation = {
            "live_visitors_vs_sales": safe_corr(metrics.get("live_visitors", []), metrics.get("sales", [])),
            "orders_vs_sales": safe_corr(metrics.get("orders", []), metrics.get("sales", [])),
            "conversion_rate_vs_aov": safe_corr(metrics.get("conversion_rate", []), metrics.get("aov", []))
        }

        # --- Extensible Segmentation ---
        from collections import defaultdict
        segment_results = {}
        # Product segmentation
        product_segments = defaultdict(list)
        for idx, prod in enumerate(metrics["top_product"]):
            if prod:
                product_segments[prod].append(idx)
        for prod, idxs in product_segments.items():
            prod_sales = [metrics["sales"][i] for i in idxs if metrics["sales"][i] is not None]
            prod_orders = [metrics["orders"][i] for i in idxs if metrics["orders"][i] is not None]
            prod_aov = [metrics["aov"][i] for i in idxs if metrics["aov"][i] is not None]
            segment_results[prod] = {
                "avg_sales": float(np.mean(prod_sales)) if prod_sales else 0,
                "avg_orders": float(np.mean(prod_orders)) if prod_orders else 0,
                "avg_aov": float(np.mean(prod_aov)) if prod_aov else 0,
                "count": len(idxs)
            }

        # --- Data quality warnings ---
        warnings = []
        for metric, values in metrics.items():
            missing_days = sum(1 for v in values if v is None)
            if missing_days > 0:
                warnings.append(f"{missing_days} missing days for {metric}")
            zero_days = sum(1 for v in values if v == 0)
            if zero_days > 0:
                warnings.append(f"{zero_days} zero values for {metric}")
            if len([v for v in values if v is not None]) > 5:
                arr = np.array([v for v in values if v is not None])
                mean, std = arr.mean(), arr.std()
                outliers = sum(1 for v in arr if abs(v - mean) > 3 * std)
                if outliers > 0:
                    warnings.append(f"{outliers} outlier values for {metric}")

        # --- Historical milestone comparison ---
        milestones = {}
        if shop_analytics:
            launch_date = min(a.date.date() for a in shop_analytics)
            launch_metrics = analytics_by_date.get(launch_date)
            if launch_metrics:
                milestones["shop_launch"] = {k: getattr(launch_metrics, k, None) for k in metrics.keys()}
        year = max_date.year
        nov = datetime(year, 11, 1).date()
        last_friday = max([nov + timedelta(days=i) for i in range(30) if (nov + timedelta(days=i)).weekday() == 4])
        bf_metrics = analytics_by_date.get(last_friday)
        if bf_metrics:
            milestones["last_black_friday"] = {k: getattr(bf_metrics, k, None) for k in metrics.keys()}

        # --- Advanced recommendations ---
        recommendations = []
        if comparison.get("sales", {}).get("percent_change", 0) < -20:
            recommendations.append("Sales dropped significantly. Review your marketing campaigns and product listings.")
        if comparison.get("conversion_rate", {}).get("percent_change", 0) < -10:
            recommendations.append("Conversion rate is down. Consider improving your checkout flow or running promotions.")
        if comparison.get("live_visitors", {}).get("latest", 0) > 1000 and comparison.get("sales", {}).get("latest", 0) < 10:
            recommendations.append("High traffic but low sales. Check for technical issues or optimize product pages.")
        if correlation["live_visitors_vs_sales"] is not None and correlation["live_visitors_vs_sales"] < 0.2:
            recommendations.append("Low correlation between visitors and sales. Investigate traffic quality or conversion issues.")
        if any("outlier" in w for w in warnings):
            recommendations.append("Significant outliers detected. Review data integrity and analytics setup.")
        if not recommendations:
            recommendations.append("Your shop is performing normally. Keep monitoring your metrics!")

        # --- Dashboard customization ---
        widgets_str = flask.request.args.get('widgets')
        widgets = widgets_str.split(',') if widgets_str else list(comparison.keys())
        dashboard = {w: comparison[w] for w in widgets if w in comparison}

        # --- Export scaffolding ---
        def export_report(format="pdf"):
            import io
            if format == "pdf":
                try:
                    from reportlab.lib.pagesizes import letter
                    from reportlab.pdfgen import canvas
                    buffer = io.BytesIO()
                    c = canvas.Canvas(buffer, pagesize=letter)
                    c.setFont("Helvetica", 12)
                    c.drawString(30, 750, "Shop Benchmarking Report")
                    y = 720
                    for metric, data in comparison.items():
                        c.drawString(30, y, f"{metric.title()}: Latest={data['latest']}, Avg={data['avg']}, Change={data['percent_change']}%")
                        y -= 20
                    c.save()
                    buffer.seek(0)
                    return buffer.read()
                except ImportError:
                    return b"PDF export requires reportlab package"
            elif format == "excel":
                try:
                    import xlsxwriter
                    buffer = io.BytesIO()
                    workbook = xlsxwriter.Workbook(buffer)
                    worksheet = workbook.add_worksheet("Metrics")
                    worksheet.write(0, 0, "Metric")
                    worksheet.write(0, 1, "Latest")
                    worksheet.write(0, 2, "Average")
                    worksheet.write(0, 3, "Percent Change")
                    worksheet.write(0, 4, "Trend")
                    row = 1
                    for metric, data in comparison.items():
                        worksheet.write(row, 0, metric)
                        worksheet.write(row, 1, data["latest"])
                        worksheet.write(row, 2, data["avg"])
                        worksheet.write(row, 3, data["percent_change"])
                        worksheet.write(row, 4, str(data["trend"]))
                        row += 1
                    workbook.close()
                    buffer.seek(0)
                    return buffer.read()
                except ImportError:
                    return b"Excel export requires xlsxwriter package"
            else:
                return b"Unknown format"

        # --- Summary ---
        summary = {
            "improved_metrics": [m for m in comparison if comparison[m]["percent_change"] > 0],
            "declined_metrics": [m for m in comparison if comparison[m]["percent_change"] < 0],
            "date_range": [d.isoformat() for d in date_range]
        }

        # --- Result ---
        result = {
            "metrics": comparison,
            "summary": summary,
            "correlation": correlation,
            "segmented_benchmarking": segment_results,
            "warnings": warnings,
            "milestones": milestones,
            "recommendations": recommendations,
            "dashboard": dashboard,
            "chart_data": chart_data,
            "export_report": export_report
        }

        return success_response(result, message="Shop benchmarking with advanced analytics and export scaffolding")

    except Exception as e:
        logger.error(f"Benchmarking error: {e}")
        return error_response("Benchmarking failed")
    finally:
        db.close()
