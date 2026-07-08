# AR Airways Database Design

Version

0.1

Status

Planning

---

# Database Philosophy

The database should be event-driven and scalable.

No feature should maintain duplicate information.

Every module should read from a shared data model.

The system should support multiple weddings in the future without major structural changes.

---

# Core Entities

Wedding

Family

Guest

Room

Passport

Boarding Pass

Event

AR Miles Transaction

Reward

Achievement

Mission

QR Code

Notification

Leaderboard

Gallery

---

# Wedding

Represents one wedding event.

Fields

Wedding ID

Wedding Name

Bride Name

Groom Name

Start Date

End Date

Venue

Theme

Logo

Primary Color

Secondary Color

Status

---

# Family

Represents one family or group.

Fields

Family ID

Family Name

Captain

Family Color

Total Guests

Total Miles

Leaderboard Rank

Room Numbers

---

# Guest

Represents one passenger.

Fields

Guest ID

Full Name

Nickname

Gender

Age Group

Mobile Number

Email

Family ID

Room ID

Passport ID

Boarding Pass ID

Current Status Level

Current AR Miles

Profile Photo

Arrival Status

Check-in Time

Diet Preference

Emergency Contact

Role

Guest

VIP

Bride Side

Groom Side

Volunteer

Admin

---

# Room

Fields

Room ID

Room Number

Country Theme

Building

Latitude

Longitude

Floor

Capacity

Occupied

Guest IDs

---

# Boarding Pass

Fields

Boarding Pass ID

Passenger Name

Flight Number

Boarding Group

Seat

Gate

Departure

Destination

Room Number

QR Code

Issue Time

Status

---

# Passport

Fields

Passport ID

Passport Number

Guest ID

Countries Visited

Passport Stamps

Journey Progress

Completion %

Achievements

Issue Date

---

# Event

Fields

Event ID

Event Name

Country Theme

Date

Start Time

End Time

Venue

Latitude

Longitude

Description

Dress Code

AR Miles Reward

Status

---

# AR Miles Transaction

Important

Never store AR Miles directly.

Every change creates a transaction.

Fields

Transaction ID

Guest ID

Date

Time

Activity

Category

Miles Earned

Miles Redeemed

Balance After Transaction

Source

QR

Admin

Game

Social Media

Mission

Verified

Remarks

---

# Reward

Fields

Reward ID

Reward Name

Category

Description

Miles Required

Quantity Available

Image

Status

---

# Achievement

Fields

Achievement ID

Title

Description

Badge

Icon

Unlock Criteria

Reward Miles

Category

---

# Mission

Fields

Mission ID

Mission Name

Description

Country

Mission Type

QR

Photo

Trivia

Puzzle

Location

Reward Miles

Difficulty

Status

---

# QR Code

Fields

QR ID

Mission ID

Location

Reward

Maximum Scans

Expiry

Status

---

# Notification

Fields

Notification ID

Guest ID

Title

Description

Category

Priority

Read

Created Time

---

# Leaderboard

Generated

Never stored manually.

Calculated from AR Miles transactions.

Types

Overall

Family

Kids

Today's Winners

Event Winners

Explorer Rank

---

# Gallery

Fields

Photo ID

Event

Guest

Location

Caption

Upload Time

Approved

---

# Relationships

Wedding

↓

Families

↓

Guests

↓

Passport

↓

Boarding Pass

↓

AR Miles Transactions

↓

Rewards

↓

Achievements

↓

Leaderboard

---

# Architecture Principles

Guest is the central entity.

Every module references Guest.

Passport references Guest.

Boarding Pass references Guest.

Transactions reference Guest.

Rewards reference Guest.

Achievements reference Guest.

Leaderboards are calculated from transactions.

Never duplicate information.

---

# Future Database

Current

Mock JSON

↓

Phase 2

Cloudflare D1

↓

Future

Reusable Event Platform

