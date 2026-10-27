export const SAMPLE_PLACEMENT_DATA = [
  {
    student_id: "STU-1081",
    student_name: "Alex Rivera",
    department: "Computer Science",
    gpa: 8.9,
    placement_status: "Placed",
    company_name: "Apex Data Systems",
    package_lpa: 18.5,
    offer_date: "2025-10-12",
    student_email: "alex.rivera@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1082",
    student_name: "Priya Sharma",
    department: "computer science", // Inconsistent casing
    gpa: 9.4,
    placement_status: "Placed",
    company_name: "CloudScale Labs",
    package_lpa: 24.0,
    offer_date: "2025-10-15",
    student_email: "priya.sharma@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1083",
    student_name: "Marcus Vance",
    department: "Information Technology",
    gpa: 7.8,
    placement_status: "Placed",
    company_name: "FinTech Orbit",
    package_lpa: 14.5,
    offer_date: "18/10/2025", // Inconsistent date format
    student_email: "marcus.vance@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1084",
    student_name: "Elena Rostova",
    department: "Computer Science",
    gpa: 8.6,
    placement_status: "Placed",
    company_name: "Quantum Logic",
    package_lpa: null, // Missing compensation for placed student
    offer_date: "2025-10-20",
    student_email: "elena.rostova@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1085",
    student_name: "Devon Brooks",
    department: "Mechanical",
    gpa: 11.2, // Out-of-bounds GPA (> 10.0)
    placement_status: "Unplaced",
    company_name: null,
    package_lpa: null,
    offer_date: null,
    student_email: "devon.brooks@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1086",
    student_name: "Ananya Patel",
    department: "Electronics",
    gpa: 8.2,
    placement_status: "Placed",
    company_name: "Semicon Dynamics",
    package_lpa: 16.0,
    offer_date: "2025-10-22",
    student_email: "ananya.patel_campus.edu", // Invalid email
    graduation_year: 2026
  },
  {
    student_id: "STU-1087",
    student_name: "Liam O'Connor",
    department: "Computer Science",
    gpa: 9.1,
    placement_status: "Placed",
    company_name: "Global AI Works",
    package_lpa: 94.5, // IQR statistical anomaly
    offer_date: "2025-10-24",
    student_email: "liam.oconnor@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1082", // Duplicate primary identifier
    student_name: "Priya Sharma",
    department: "Computer Science",
    gpa: 9.4,
    placement_status: "Placed",
    company_name: "CloudScale Labs",
    package_lpa: 24.0,
    offer_date: "2025-10-15",
    student_email: "priya.sharma@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1088",
    student_name: "Sophia Zhang",
    department: "Information Technology",
    gpa: -1.5, // Negative GPA violation
    placement_status: "Placed",
    company_name: "ByteWave Network",
    package_lpa: 15.0,
    offer_date: "2025-10-28",
    student_email: "sophia.zhang@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1089",
    student_name: "Tariq Mansoor",
    department: "computer science",
    gpa: 8.0,
    placement_status: "Unplaced",
    company_name: null,
    package_lpa: null,
    offer_date: null,
    student_email: "tariq.m@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1090",
    student_name: "Chloe Dubois",
    department: "Electronics",
    gpa: 8.7,
    placement_status: "Placed",
    company_name: "AeroTech Avionics",
    package_lpa: 19.2,
    offer_date: "30/10/2025",
    student_email: "chloe.dubois@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1091",
    student_name: "Rohan Verma",
    department: "Computer Science",
    gpa: 9.0,
    placement_status: "Placed",
    company_name: "DataNova Cloud",
    package_lpa: null,
    offer_date: "2025-11-02",
    student_email: "rohan.verma@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1092",
    student_name: "Hannah Schmidt",
    department: "Mechanical",
    gpa: 7.9,
    placement_status: "Placed",
    company_name: "Precision Robotics",
    package_lpa: 13.8,
    offer_date: "2025-11-05",
    student_email: "hannah.s@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1093",
    student_name: "Karan Johar",
    department: "Civil",
    gpa: 7.5,
    placement_status: "Invalid_Status",
    company_name: "InfraBuild Corp",
    package_lpa: 11.0,
    offer_date: "2025-11-08",
    student_email: "karan.johar@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1094",
    student_name: "Maya Lin",
    department: "Computer Science",
    gpa: 9.3,
    placement_status: "Placed",
    company_name: "Starlight Software",
    package_lpa: 22.5,
    offer_date: "2025-11-10",
    student_email: "maya.lin@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1095",
    student_name: "James Wilson",
    department: "Information Technology",
    gpa: 8.3,
    placement_status: "Placed",
    company_name: "CyberShield Systems",
    package_lpa: 17.0,
    offer_date: "2025-11-12",
    student_email: "james.wilson@campus.edu",
    graduation_year: 2029
  },
  {
    student_id: "STU-1096",
    student_name: "Zainab Al-Fassi",
    department: "computer science",
    gpa: 8.8,
    placement_status: "Placed",
    company_name: "DeepMind Nexus",
    package_lpa: 28.0,
    offer_date: "2025-11-14",
    student_email: "zainab.af@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1097",
    student_name: "Lucas Silva",
    department: "Electronics",
    gpa: 8.1,
    placement_status: "Placed",
    company_name: "Solaria Micro",
    package_lpa: 15.5,
    offer_date: "2025-11-16",
    student_email: "lucas.silva@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1098",
    student_name: "Emily Watson",
    department: "Computer Science",
    gpa: 9.5,
    placement_status: "Placed",
    company_name: "HyperScale DB",
    package_lpa: 26.0,
    offer_date: "2025-11-18",
    student_email: "emily.w@campus.edu",
    graduation_year: 2026
  },
  {
    student_id: "STU-1099",
    student_name: "Vikram Malhotra",
    department: "Mechanical",
    gpa: 7.7,
    placement_status: "Unplaced",
    company_name: null,
    package_lpa: null,
    offer_date: null,
    student_email: "vikram.m@campus.edu",
    graduation_year: 2026
  }
];

export const SAMPLE_ENROLLMENT_LEDGER = [
  {
    student_id: "STU-1081",
    official_name: "Alex Rivera",
    official_department: "Computer Science",
    enrollment_year: 2022,
    advisor: "Dr. Karen Vance",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1082",
    official_name: "Priya Sharma",
    official_department: "Computer Science",
    enrollment_year: 2022,
    advisor: "Dr. Arthur Pendelton",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1083",
    official_name: "Marcus Vance",
    official_department: "Information Technology",
    enrollment_year: 2022,
    advisor: "Dr. Karen Vance",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1084",
    official_name: "Elena Rostova",
    official_department: "Computer Science",
    enrollment_year: 2022,
    advisor: "Dr. Arthur Pendelton",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1085",
    official_name: "Devon Brooks",
    official_department: "Mechanical Engineering",
    enrollment_year: 2022,
    advisor: "Dr. Sean Miller",
    fee_clearance: "Pending"
  },
  {
    student_id: "STU-1086",
    official_name: "Ananya Patel",
    official_department: "Electronics & Communication",
    enrollment_year: 2022,
    advisor: "Dr. Sean Miller",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1087",
    official_name: "Liam O'Connor",
    official_department: "Computer Science",
    enrollment_year: 2022,
    advisor: "Dr. Arthur Pendelton",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1088",
    official_name: "Sophia Zhang",
    official_department: "Information Technology",
    enrollment_year: 2022,
    advisor: "Dr. Karen Vance",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1089",
    official_name: "Tariq Mansoor",
    official_department: "Computer Science",
    enrollment_year: 2022,
    advisor: "Dr. Arthur Pendelton",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1090",
    official_name: "Chloe Dubois",
    official_department: "Electronics & Communication",
    enrollment_year: 2022,
    advisor: "Dr. Sean Miller",
    fee_clearance: "Cleared"
  },
  {
    student_id: "STU-1120",
    official_name: "Gabriel Ramos",
    official_department: "Mechanical Engineering",
    enrollment_year: 2022,
    advisor: "Dr. Sean Miller",
    fee_clearance: "Cleared"
  }
];
