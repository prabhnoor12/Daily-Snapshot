<<<<<<< HEAD
# Daily Snapshot - Shopify Analytics App

## Concept

**Daily Snapshot** is a simple yet powerful analytics app for Shopify merchants. It provides a clean, single-page dashboard that shows the most important metrics for the **current day**. It's designed to be the first thing a merchant checks in the morning and glances at throughout the day to get a real-time pulse of their store's performance.

## Why It's Valuable

*   **At-a-Glance Insights:** Merchants are busy. This app saves them from digging through complex reports to know how their day is going.
*   **Real-time Pulse:** It provides a near real-time pulse of their store's performance, allowing for quick reactions to marketing campaigns or promotions.
*   **Motivation:** Seeing sales and visitors for the day can be highly motivating.

## Core Features


The app focuses on simplicity and immediate value. The dashboard displays:

**Today's Sales:** Total revenue for the day so far.
1. **Today's Orders:** Total number of orders placed.
2. **Average Order Value (AOV):** Calculated as `Today's Sales / Today's Orders`.
3. **Live Visitors:** Number of visitors currently on the site (or in the last 5 minutes).
4. **Top Selling Product of the Day:** The product that has generated the most revenue today.

## Premium Features ($20/month)

These features provide actionable insights and convenience, justifying the subscription price:

1. **Day-over-Day Performance:** See today’s sales, orders, and visitors compared to yesterday.
2. **7-Day Trend Charts:** Simple line charts for sales, orders, and visitors over the past week.
3. **Top Products of the Day:** List the top 3 selling products with sales and order counts.
4. **Order Status Breakdown:** Display counts of fulfilled, pending, and cancelled orders for today.
5. **Real-Time Visitor Count:** Show how many visitors are currently active or were active in the last 5 minutes.
6. **Average Order Value (AOV):** Calculate and display today’s AOV.
7. **Quick Export:** Export today’s snapshot as a PDF or CSV.
8. **Customizable Dashboard:** Choose which metrics to display.
9. **Basic Alerts:** Get notified when sales hit a daily goal or when inventory is low for top products.

## Tech Stack

This app is built using a modern and efficient tech stack, ideal for Shopify app development.

*   **Backend:** **Node.js** with the **Express** framework. This handles API requests to and from Shopify.
*   **Frontend:** **React** for building a dynamic and responsive user interface.
*   **UI Components:** **Shopify Polaris** is used to ensure the app's look and feel is consistent with the Shopify admin dashboard.
*   **Shopify API:** The app uses the **Shopify Admin API** to fetch all the necessary data. No external database is required for the initial version, which simplifies development.

## How It Works

1.  The merchant opens the app in their Shopify admin.
2.  The React frontend loads and makes a request to the Node.js backend.
3.  The backend server calls the Shopify Admin API to get the orders and visitor data for the current day.
4.  The data is processed (e.g., sales are summed, orders are counted).
5.  The processed data is sent back to the frontend and displayed in the dashboard.
=======
# Daily-Snapshot
>>>>>>> 5a82c728b564bf86b7b6a97574cc438c959225d5
