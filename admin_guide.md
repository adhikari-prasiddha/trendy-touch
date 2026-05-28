# Trendy Touch Makeup Studio & Academy
## Comprehensive Administrator & Staff Portal Guide

This guide details all administrative controls, management features, and workflow patterns for Trendy Touch Makeup Studio & Academy system operators.

---

### Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Portal Access & Login Credentials](#2-portal-access--login-credentials)
3. [Dashboard Metrics & Scorecards](#3-dashboard-metrics--scorecards)
4. [Managing Client Bookings](#4-managing-client-bookings)
5. [Verifying Academy Students](#5-verifying-academy-students)
6. [Auditing Client Reviews & Testimonials](#6-auditing-client-reviews--testimonials)
7. [Publishing & Managing the Media Gallery](#7-publishing-and-managing-the-media-gallery)
8. [Real-Time Alerts & Notification Settings](#8-real-time-alerts--notification-settings)

---

### 1. System Overview & Architecture
The Trendy Touch system runs on a client-side database built on browser `localStorage`. This means:
* All bookings, student registrations, review feedback, and gallery uploads are stored directly in the browser's local cache database.
* Data persists across page reloads and browser sessions.
* No network database setup is required to run the system, making the dashboard exceptionally fast.

---

### 2. Portal Access & Login Credentials
To access the admin workspace:
1. Click the **Admin Portal** button located in the top-right header section of the landing page.
2. In the modal, click the **Staff** tab (the portal default).
3. Enter the master staff access password:
   * **Master Password**: `staff123`
4. Click **Log In as Staff**.

> [!WARNING]
> Keep the master password secure. Anyone with this password has complete write access to change client bookings, verify students, delete reviews, and post to the official media feed.

---

### 3. Dashboard Metrics & Scorecards
Once logged in, the top of the portal displays real-time key performance metrics:
* **Total Bookings**: The total cumulative count of all booking entries in the database.
* **Active Students**: The number of students registered for the academy courses.
* **Average Rating**: The average star rating (out of 5) calculated dynamically from all published client feedback.

---

### 4. Managing Client Bookings
Click the **Bookings** tab on the left-hand navigation pane of the dashboard. This interface displays all studio and home service bookings.

#### A. Columns Explained:
* **Booking ID**: A unique, auto-generated code prefixed with `TT-` (e.g. `TT-59281`).
* **Client Details**: The client’s full name and phone number.
* **Location**: Indicates whether it is a **Studio Session** or a **Home Service** (which displays the client’s physical address).
* **Package & Add-ons**: The selected makeup package and optional luxury services (Nail Art, Hair Extensions, Sheet Masks).
* **Date & Time**: Scheduled date and time of the session.
* **Total Price**: Total cost including base package rate, add-ons, and home service travel fees (Rs. 2,000).
* **Status**: Displays colored status badges: `Pending`, `Confirmed`, `Rescheduled`, or `Cancelled`.

#### B. Searching and Filtering:
* Use the **Search bar** to search instantly by *Client Name, Phone Number, Package, or Booking ID*.
* Use the **Status dropdown filter** to display bookings by specific statuses.

#### C. Available Booking Actions:
* **Confirm**: Converts a `Pending` status to `Confirmed`. A success sound and notification toast will pop up.
* **Reschedule**: Launches modal prompts requesting a new date (`YYYY-MM-DD`) and time slot. Updates status to `Rescheduled`.
* **Cancel**: Marks the booking as `Cancelled` (this operation is final and retains the booking in logs for record-keeping).

---

### 5. Verifying Academy Students
Click the **Students** tab on the left navigation pane of the dashboard. This section lists all students registered for professional and self-makeup courses.

* **Privacy Isolation**: While students can only see their own private information in their portal, **Staff members can view all student data** (including phone, email, notes, start date, and password).
* **Verification Visit Workflow**:
  1. When a student registers on the website, they are placed in **Pre-Booked** status.
  2. The student must physically visit the studio on the next working day (Sunday to Friday, 10am-3pm).
  3. Locate the student in the table and click the green **✓ Verify & Approve** button.
  4. Confirm the prompt. This changes the status to **Confirmed** and enables their Student Portal login.

---

### 6. Auditing Client Reviews & Testimonials
Click the **Feedbacks** tab in the dashboard. This contains all feedback submitted by clients through the landing page form.

* **Auditing Reviews**: Scroll through the list to review client comments.
* **Delete Action**: Click the red **Delete** button next to any review to permanently remove it. 
  * *Use case*: Removing spam, offensive text, or testing reviews.
  * *Note*: Deleting a review immediately recalculates the dashboard's average star rating and removes the slide from the home page reviews carousel.

---

### 7. Publishing and Managing the Media Gallery
Click the **Gallery** tab in the dashboard. This allows staff to maintain the "Client Transformations & Studio Moments" feed on the main website.

#### A. Uploading New Media (Photos & Videos):
1. **Choose Category/Tag**: Select from *Bridal Glam, Party Look, Academy Transformation, Before & After, or Studio Vibe*.
2. **Media Selection (Drag-and-Drop or Click)**:
   * Drag a photo or video file directly onto the dashed upload box, or click the box to select a file from your computer.
   * **Size Limit**: Maximum file size is 50MB.
   * A preview of the selected image or video player will appear in the box.
3. **Fill Out metadata**: Enter the name of the artist ("Posted By") and a short description ("Caption").
4. **Publish**: Click **Publish to Gallery**. The file is converted locally to a base64 string, saved to `localStorage`, and instantly rendered at the top of the client landing page gallery.

#### B. Deleting Gallery Posts:
* Locate the post in the gallery listing and click the **🗑️ Delete** button to remove it instantly from the public landing page feed.

---

### 8. Real-Time Alerts & Notification Settings
To help staff respond immediately to clients, the dashboard includes a real-time notification engine.

* **Desktop Alerts Activation**: 
  * Click the **🔔 Enable Desktop Alerts** button at the top of the dashboard.
  * Allow browser notification permissions when prompted.
  * Once enabled, the button updates to *🔔 Desktop Alerts Enabled*.
* **Incoming Alerts**: Whenever a user submits a pre-booking or enrolls in a course:
  * A system desktop notification slides out containing client details.
  * An in-app toast alert appears with a sound effect.
  * The dashboard tables are updated instantly in the background.
