// src/lib/rolesData.ts
//
// ── PHASE 9: statistics removed from PROSE fields ─────────────────────────
// Phase 8 removed the fabricated demandGrowth and avgAtsScore FIELDS. It missed
// three claims written into the prose, which is worse, because FAQ answers are
// emitted as FAQPage structured data on role pages — a fabricated number
// published as machine-readable markup for other systems to cite:
//
//   • "resumes scoring above 70 are 3.5x more likely to receive an interview"
//   • "PMP ... appears in 68% of PM job postings"
//   • "Product-focused AI engineer roles (70% of market)"
//
// scripts/doctor.mjs now scans prose for statistic-shaped claims, so this
// class of problem surfaces before a build rather than after a policy review.
//
// ── FIELDS REMOVED IN PHASE 8 ──────────────────────────────────────────────
// demandGrowth ("+28% YoY", "+35% YoY", ...) and avgAtsScore (55, 61, ...)
// were removed from every role. Both were presented as measurements:
//
//   • demandGrowth had no source, no methodology and no date. Every role
//     carried a confident year-on-year growth figure that nothing supports.
//   • avgAtsScore implied an average ATS score computed across real scans.
//     No such average was ever computed — the numbers were chosen.
//
// Your brief is explicit that fabricated statistics must not ship, and
// scripts/seo-check.mjs now fails a build that reintroduces the ones we know
// about. demandTrend (a qualitative label) is kept because it is a judgement,
// not a measurement, and is presented as one.
//
// If you want a real average ATS score per role, lib/marketIntel.ts computes
// it from your own telemetry once the sample passes MIN_SAMPLE.

// lib/rolesData.ts
import { Role } from "@/types";

export const roles: Role[] = [
  // ─── TECHNOLOGY ───────────────────────────────────────────────────────────
  {
    slug: "senior-software-engineer",
    title: "Senior Software Engineer",
    category: "Technology",
    description:
      "Senior Software Engineers lead the design, development, and delivery of scalable software systems. They mentor junior developers, collaborate across teams, and drive architectural decisions.",
    salaryRange: {
      india: "₹20L – ₹60L",
      global: "$140K – $220K",
      currency: "INR/USD",
    },
    demandTrend: "very-high",
    topKeywords: [
      { keyword: "System Design", importance: "critical" },
      { keyword: "Microservices", importance: "critical" },
      { keyword: "REST APIs", importance: "critical" },
      { keyword: "CI/CD", importance: "high" },
      { keyword: "Cloud Architecture", importance: "high" },
      { keyword: "Code Review", importance: "high" },
      { keyword: "Agile", importance: "high" },
      { keyword: "Docker", importance: "high" },
      { keyword: "Kubernetes", importance: "medium" },
      { keyword: "Performance Optimization", importance: "medium" },
      { keyword: "Technical Leadership", importance: "medium" },
      { keyword: "PostgreSQL", importance: "medium" },
      { keyword: "Redis", importance: "medium" },
      { keyword: "Unit Testing", importance: "medium" },
      { keyword: "TypeScript", importance: "medium" },
    ],
    criticalSkills: [
      "System Design",
      "Algorithm Optimization",
      "API Design",
      "Database Modeling",
      "Code Architecture",
    ],
    softSkills: [
      "Technical Leadership",
      "Mentoring",
      "Cross-team Collaboration",
      "Problem Solving",
    ],
    certifications: [
      "AWS Certified Solutions Architect",
      "Google Cloud Professional",
      "CKA (Kubernetes)",
    ],
    commonTools: [
      "VS Code",
      "IntelliJ",
      "GitHub",
      "Jira",
      "Confluence",
      "Datadog",
      "Postman",
    ],
    faqs: [
      {
        question:
          "What ATS keywords are most important for a Senior Software Engineer resume?",
        answer:
          'The most impactful keywords are: System Design, Microservices, REST APIs, CI/CD pipelines, Cloud Architecture (AWS/GCP/Azure), and specific programming languages (Java, Python, Go). Include measurable achievements like "reduced API latency by 40%" to boost your score beyond keyword matching.',
      },
      {
        question:
          "How should a Senior Software Engineer format their resume for ATS?",
        answer:
          'Use a clean, single-column format. Avoid tables, text boxes, and graphics. Use standard section headers (Experience, Skills, Education). Spell out acronyms at least once (e.g., "Continuous Integration/Continuous Deployment (CI/CD)"). Submit as PDF from a Word-based template.',
      },
      {
        question: "What is a good ATS score for a Senior Software Engineer?",
        answer:
          "A score of 75+ is excellent. We do not publish an interview-rate multiplier: we have not measured one, and the figures circulating online do not trace to primary research. Focus first on matching the top 10 keywords from the job description exactly as written.",
      },
    ],
    relatedRoles: [
      "staff-software-engineer",
      "software-architect",
      "full-stack-developer",
      "devops-engineer",
    ],
    resumeTips: [
      'Quantify impact: "Led team of 8 engineers to deliver X feature 2 weeks ahead of schedule"',
      "List specific tech stack for each role, not just in a skills section",
      'Include system design wins: "Designed event-driven architecture serving 2M RPM"',
      "Mention open-source contributions or GitHub projects with star counts",
    ],
    hiringCompanies: [
      "Google",
      "Microsoft",
      "Amazon",
      "Flipkart",
      "Razorpay",
      "PhonePe",
      "Swiggy",
      "Zomato",
    ],
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    category: "Product & Design",
    description:
      "Product Managers own the product vision, strategy, and roadmap. They work at the intersection of business, technology, and design to deliver products users love.",
    salaryRange: {
      india: "₹18L – ₹55L",
      global: "$120K – $200K",
      currency: "INR/USD",
    },
    demandTrend: "very-high",
    topKeywords: [
      { keyword: "Product Roadmap", importance: "critical" },
      { keyword: "User Research", importance: "critical" },
      { keyword: "Go-to-Market Strategy", importance: "critical" },
      { keyword: "OKRs", importance: "high" },
      { keyword: "A/B Testing", importance: "high" },
      { keyword: "Stakeholder Management", importance: "high" },
      { keyword: "Data-Driven", importance: "high" },
      { keyword: "Agile/Scrum", importance: "high" },
      { keyword: "KPIs", importance: "medium" },
      { keyword: "Customer Journey", importance: "medium" },
      { keyword: "Competitive Analysis", importance: "medium" },
      { keyword: "MVP", importance: "medium" },
      { keyword: "Product Analytics", importance: "medium" },
      { keyword: "SQL", importance: "medium" },
      { keyword: "PRD Writing", importance: "medium" },
    ],
    criticalSkills: [
      "Product Strategy",
      "Roadmap Planning",
      "User Research",
      "Data Analysis",
      "Cross-functional Leadership",
    ],
    softSkills: [
      "Communication",
      "Prioritization",
      "Influence without Authority",
      "Customer Empathy",
    ],
    certifications: [
      "Pragmatic Institute CPM",
      "Product School CPO",
      "Scrum Product Owner (CSPO)",
    ],
    commonTools: [
      "Jira",
      "Confluence",
      "Figma",
      "Mixpanel",
      "Amplitude",
      "Looker",
      "Miro",
      "ProductBoard",
    ],
    faqs: [
      {
        question:
          "What keywords do ATS systems look for in a Product Manager resume?",
        answer:
          "Critical PM keywords include: Product Roadmap, Go-to-Market (GTM), OKRs/KPIs, A/B Testing, User Research, Stakeholder Management, and Agile/Scrum. For senior roles, add: P&L ownership, Platform Strategy, and API/technical fluency. Mirror the exact terminology from the job description.",
      },
      {
        question:
          "Should a Product Manager include technical skills on their resume?",
        answer:
          "Yes, absolutely. ATS systems for PM roles increasingly filter for SQL, data analysis, API familiarity, and basic coding. Even a basic SQL mention improves your score significantly. Include tools like Mixpanel, Amplitude, or Looker to demonstrate data literacy.",
      },
      {
        question:
          "How long should a Product Manager resume be for ATS optimization?",
        answer:
          'One page for 0-5 years experience; two pages for 5+ years. ATS systems do not penalize for length, but recruiters do. Every bullet should contain a metric. Use the formula: "Did X resulting in Y, measured by Z."',
      },
    ],
    relatedRoles: [
      "senior-product-manager",
      "technical-product-manager",
      "growth-product-manager",
      "ux-researcher",
    ],
    resumeTips: [
      'Start bullets with power verbs: "Launched," "Scaled," "Reduced," "Increased"',
      'Include revenue/growth impact: "Drove $2M ARR through feature X"',
      "Mention team sizes you cross-functioned with",
      'Show data fluency: "Analyzed cohort data using SQL + Mixpanel"',
    ],
    hiringCompanies: [
      "Google",
      "Meta",
      "Meesho",
      "CRED",
      "Groww",
      "Zepto",
      "Ola",
      "Nykaa",
    ],
  },
  {
    slug: "senior-product-manager",
    title: "Senior Product Manager",
    category: "Product & Design",
    description:
      "Senior Product Managers drive complex product initiatives, lead large cross-functional teams, and own significant product lines with measurable business impact.",
    salaryRange: {
      india: "₹30L – ₹80L",
      global: "$160K – $250K",
      currency: "INR/USD",
    },
    demandTrend: "very-high",
    topKeywords: [
      { keyword: "Product Strategy", importance: "critical" },
      { keyword: "P&L Ownership", importance: "critical" },
      { keyword: "Platform Strategy", importance: "critical" },
      { keyword: "Executive Communication", importance: "high" },
      { keyword: "Product Vision", importance: "high" },
      { keyword: "Market Sizing", importance: "high" },
      { keyword: "OKRs", importance: "high" },
      { keyword: "Growth Strategy", importance: "high" },
      { keyword: "Monetization", importance: "medium" },
      { keyword: "Enterprise Sales Alignment", importance: "medium" },
      { keyword: "API Strategy", importance: "medium" },
      { keyword: "Machine Learning Applications", importance: "medium" },
    ],
    criticalSkills: [
      "Strategic Vision",
      "Executive Alignment",
      "Large Team Leadership",
      "Market Analysis",
      "Financial Modeling",
    ],
    softSkills: [
      "Executive Presence",
      "Strategic Thinking",
      "Conflict Resolution",
      "Negotiation",
    ],
    certifications: [
      "Pragmatic Institute PMC-IV",
      "Harvard Business Analytics Program",
    ],
    commonTools: [
      "Jira",
      "Tableau",
      "Salesforce",
      "Figma",
      "PowerBI",
      "Excel",
      "Pitch.com",
    ],
    faqs: [
      {
        question: "What makes a Senior PM resume stand out in ATS?",
        answer:
          'Senior PM resumes need to show scope and scale. Include revenue figures, team sizes, and business impact. Keywords like "P&L ownership," "platform strategy," "executive stakeholder management," and "0-to-1 product building" signal seniority to ATS algorithms.',
      },
      {
        question:
          "How do I show strategic thinking in my Senior PM resume for ATS?",
        answer:
          'Use keywords: "Market Opportunity Analysis," "Competitive Positioning," "Business Case Development," "3-year Product Roadmap." Back them with outcomes: "Identified $50M whitespace opportunity through market analysis." Combine keyword density with concrete metrics for maximum ATS + human reviewer impact.',
      },
    ],
    relatedRoles: [
      "product-manager",
      "director-of-product",
      "technical-product-manager",
      "chief-product-officer",
    ],
    resumeTips: [
      'Lead with scale: "Managed $10M product portfolio across 3 verticals"',
      'Show org influence: "Aligned 4 VP stakeholders on 3-year platform strategy"',
      "Include failed experiments with learnings — shows maturity",
    ],
    hiringCompanies: [
      "Amazon",
      "Google",
      "Razorpay",
      "PhonePe",
      "Swiggy",
      "Byju's",
      "Paytm",
    ],
  },
  {
    slug: "data-scientist",
    title: "Data Scientist",
    category: "Data & Analytics",
    description:
      "Data Scientists extract actionable insights from complex datasets, build predictive models, and communicate findings to drive business decisions.",
    salaryRange: {
      india: "₹12L – ₹40L",
      global: "$100K – $175K",
      currency: "INR/USD",
    },
    demandTrend: "very-high",
    topKeywords: [
      { keyword: "Machine Learning", importance: "critical" },
      { keyword: "Python", importance: "critical" },
      { keyword: "Statistical Modeling", importance: "critical" },
      { keyword: "Deep Learning", importance: "high" },
      { keyword: "SQL", importance: "high" },
      { keyword: "TensorFlow", importance: "high" },
      { keyword: "PyTorch", importance: "high" },
      { keyword: "Feature Engineering", importance: "high" },
      { keyword: "A/B Testing", importance: "medium" },
      { keyword: "NLP", importance: "medium" },
      { keyword: "Computer Vision", importance: "medium" },
      { keyword: "Data Pipeline", importance: "medium" },
      { keyword: "Spark", importance: "medium" },
      { keyword: "Scikit-learn", importance: "medium" },
    ],
    criticalSkills: [
      "ML Model Development",
      "Statistical Analysis",
      "Data Wrangling",
      "Model Deployment",
      "Experimentation",
    ],
    softSkills: [
      "Data Storytelling",
      "Stakeholder Communication",
      "Problem Framing",
      "Business Acumen",
    ],
    certifications: [
      "TensorFlow Developer Certificate",
      "AWS ML Specialty",
      "Coursera Deep Learning Specialization",
    ],
    commonTools: [
      "Jupyter",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "MLflow",
      "Databricks",
      "BigQuery",
    ],
    faqs: [
      {
        question:
          "What are the most important ATS keywords for a Data Scientist resume?",
        answer:
          "Must-have keywords: Machine Learning, Python, SQL, Statistical Modeling, A/B Testing, Deep Learning, Feature Engineering. For NLP roles add: Transformers, BERT, LLM Fine-tuning. For computer vision: CNN, Object Detection, OpenCV. Always match the exact terms in the job description.",
      },
      {
        question:
          "Should I include Kaggle competitions on my Data Scientist resume?",
        answer:
          'Yes — with context. Include competition name, your rank/percentile, and the technique that worked. "Top 3% in Kaggle IEEE-CIS Fraud Detection (XGBoost + feature engineering)" signals both skill and initiative to ATS-filtered resumes.',
      },
    ],
    relatedRoles: [
      "machine-learning-engineer",
      "data-analyst",
      "ai-engineer",
      "business-intelligence-analyst",
    ],
    resumeTips: [
      'List specific model types, not just "built models"',
      'Include dataset sizes: "Processed 500GB daily logs using Spark"',
      'Show business outcomes: "Fraud detection model saved $2M annually"',
    ],
    hiringCompanies: [
      "Google",
      "Microsoft",
      "Walmart Labs",
      "Flipkart",
      "Razorpay",
      "Dream11",
      "ShareChat",
    ],
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    category: "Technology",
    description:
      "DevOps Engineers bridge development and operations, building CI/CD pipelines, managing cloud infrastructure, and ensuring system reliability at scale.",
    salaryRange: {
      india: "₹10L – ₹35L",
      global: "$110K – $180K",
      currency: "INR/USD",
    },
    demandTrend: "very-high",
    topKeywords: [
      { keyword: "Kubernetes", importance: "critical" },
      { keyword: "Docker", importance: "critical" },
      { keyword: "CI/CD", importance: "critical" },
      { keyword: "Terraform", importance: "high" },
      { keyword: "AWS", importance: "high" },
      { keyword: "Helm", importance: "high" },
      { keyword: "GitOps", importance: "high" },
      { keyword: "Infrastructure as Code", importance: "high" },
      { keyword: "Prometheus", importance: "medium" },
      { keyword: "Grafana", importance: "medium" },
      { keyword: "Jenkins", importance: "medium" },
      { keyword: "Ansible", importance: "medium" },
      { keyword: "Linux", importance: "medium" },
      { keyword: "SRE", importance: "medium" },
    ],
    criticalSkills: [
      "Container Orchestration",
      "Cloud Platforms",
      "IaC",
      "Monitoring & Observability",
      "Security Hardening",
    ],
    softSkills: [
      "Incident Response",
      "On-call Ownership",
      "Documentation",
      "Developer Empathy",
    ],
    certifications: [
      "CKA",
      "AWS DevOps Engineer Professional",
      "HashiCorp Terraform Associate",
    ],
    commonTools: [
      "GitHub Actions",
      "ArgoCD",
      "Datadog",
      "PagerDuty",
      "Vault",
      "Istio",
      "Nginx",
    ],
    faqs: [
      {
        question: "What keywords should a DevOps Engineer prioritize for ATS?",
        answer:
          'Critical: Kubernetes, Docker, CI/CD, Terraform, AWS/GCP/Azure. Secondary: GitOps, Helm, ArgoCD, Prometheus, Grafana, Infrastructure as Code (IaC). Senior roles add: FinOps, SRE practices, Chaos Engineering. Always include specific cloud services: "AWS EKS, S3, RDS, Lambda."',
      },
    ],
    relatedRoles: [
      "senior-software-engineer",
      "cloud-architect",
      "site-reliability-engineer",
      "platform-engineer",
    ],
    resumeTips: [
      'Quantify uptime: "Maintained 99.97% SLA across 50+ microservices"',
      'Show cost impact: "Reduced AWS spend 35% via spot instances + rightsizing"',
      'Include scale: "Managed 500-node Kubernetes cluster"',
    ],
    hiringCompanies: [
      "Amazon",
      "Razorpay",
      "PhonePe",
      "Zepto",
      "Ola",
      "InMobi",
      "Zoho",
      "Freshworks",
    ],
  },
  {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    category: "Technology",
    description:
      "Full Stack Developers build end-to-end web applications, working across frontend UI, backend APIs, and database layers with strong ownership of complete features.",
    salaryRange: {
      india: "₹8L – ₹30L",
      global: "$90K – $160K",
      currency: "INR/USD",
    },
    demandTrend: "high",
    topKeywords: [
      { keyword: "React", importance: "critical" },
      { keyword: "Node.js", importance: "critical" },
      { keyword: "TypeScript", importance: "critical" },
      { keyword: "REST API", importance: "high" },
      { keyword: "PostgreSQL", importance: "high" },
      { keyword: "Next.js", importance: "high" },
      { keyword: "GraphQL", importance: "medium" },
      { keyword: "MongoDB", importance: "medium" },
      { keyword: "Redis", importance: "medium" },
      { keyword: "Docker", importance: "medium" },
      { keyword: "AWS", importance: "medium" },
      { keyword: "TailwindCSS", importance: "medium" },
    ],
    criticalSkills: [
      "Frontend Development",
      "Backend API Design",
      "Database Management",
      "State Management",
      "Deployment",
    ],
    softSkills: [
      "Product Thinking",
      "Self-direction",
      "Fast Iteration",
      "Code Quality",
    ],
    certifications: ["Meta Front-End Developer", "AWS Cloud Practitioner"],
    commonTools: [
      "VS Code",
      "GitHub",
      "Vercel",
      "Figma",
      "Postman",
      "Stripe",
      "Firebase",
    ],
    faqs: [
      {
        question: "What full stack developer keywords do ATS systems scan for?",
        answer:
          "Frontend: React, Next.js, TypeScript, TailwindCSS, Redux. Backend: Node.js, Express, FastAPI, REST APIs, GraphQL. Database: PostgreSQL, MongoDB, Redis. DevOps: Docker, CI/CD, AWS/Vercel. List your complete tech stack with specific versions when relevant.",
      },
    ],
    relatedRoles: [
      "senior-software-engineer",
      "frontend-developer",
      "backend-developer",
      "devops-engineer",
    ],
    resumeTips: [
      "List every major project with tech stack, your role, and outcome",
      "Include open-source projects or side projects with GitHub links",
      'Specify frontend AND backend work per job — don\'t just say "full stack"',
    ],
    hiringCompanies: [
      "Startups",
      "Razorpay",
      "Freshworks",
      "Zoho",
      "InMobi",
      "HashedIn",
      "ThoughtWorks",
    ],
  },
  // ─── BUSINESS & OPERATIONS ───────────────────────────────────────────────
  {
    slug: "business-analyst",
    title: "Business Analyst",
    category: "Business & Operations",
    description:
      "Business Analysts bridge the gap between business stakeholders and technical teams, translating requirements into actionable specifications and measuring outcomes.",
    salaryRange: {
      india: "₹6L – ₹20L",
      global: "$75K – $130K",
      currency: "INR/USD",
    },
    demandTrend: "high",
    topKeywords: [
      { keyword: "Requirements Gathering", importance: "critical" },
      { keyword: "Business Process Mapping", importance: "critical" },
      { keyword: "SQL", importance: "high" },
      { keyword: "Stakeholder Management", importance: "high" },
      { keyword: "UAT", importance: "high" },
      { keyword: "Use Cases", importance: "high" },
      { keyword: "Agile", importance: "high" },
      { keyword: "JIRA", importance: "medium" },
      { keyword: "Data Analysis", importance: "medium" },
      { keyword: "Process Improvement", importance: "medium" },
      { keyword: "Wireframing", importance: "medium" },
      { keyword: "Power BI", importance: "medium" },
    ],
    criticalSkills: [
      "Requirements Analysis",
      "Process Modeling",
      "Data Analysis",
      "Communication",
      "Documentation",
    ],
    softSkills: [
      "Active Listening",
      "Critical Thinking",
      "Negotiation",
      "Presentation",
    ],
    certifications: ["CBAP", "PMI-PBA", "ECBA", "Scrum Master (CSM)"],
    commonTools: [
      "Confluence",
      "Jira",
      "Visio",
      "Lucidchart",
      "Excel",
      "Power BI",
      "Balsamiq",
    ],
    faqs: [
      {
        question:
          "What are the top ATS keywords for a Business Analyst resume?",
        answer:
          'Must-have: Requirements Gathering, Business Process Analysis, Stakeholder Management, User Acceptance Testing (UAT), and Agile. Add SQL for data-heavy roles. Use "As-Is/To-Be process mapping" and "Business Requirements Document (BRD)" to signal domain depth.',
      },
    ],
    relatedRoles: [
      "product-manager",
      "project-manager",
      "data-analyst",
      "scrum-master",
    ],
    resumeTips: [
      'Quantify process improvements: "Reduced onboarding time 40% by redesigning workflow"',
      'Show tools: "Created 50+ user stories in Jira; maintained Confluence documentation"',
    ],
    hiringCompanies: [
      "Accenture",
      "TCS",
      "Infosys",
      "Wipro",
      "Cognizant",
      "Capgemini",
      "Deloitte",
    ],
  },
  {
    slug: "project-manager",
    title: "Project Manager",
    category: "Business & Operations",
    description:
      "Project Managers plan, execute, and close projects on time and within budget, coordinating teams and stakeholders to deliver measurable outcomes.",
    salaryRange: {
      india: "₹8L – ₹25L",
      global: "$90K – $150K",
      currency: "INR/USD",
    },
    demandTrend: "stable",
    topKeywords: [
      { keyword: "Project Lifecycle", importance: "critical" },
      { keyword: "Risk Management", importance: "critical" },
      { keyword: "Stakeholder Management", importance: "critical" },
      { keyword: "Budget Management", importance: "high" },
      { keyword: "Agile", importance: "high" },
      { keyword: "PMP", importance: "high" },
      { keyword: "Waterfall", importance: "high" },
      { keyword: "Resource Planning", importance: "high" },
      { keyword: "MS Project", importance: "medium" },
      { keyword: "Gantt Chart", importance: "medium" },
      { keyword: "Change Management", importance: "medium" },
      { keyword: "Scrum", importance: "medium" },
    ],
    criticalSkills: [
      "Project Planning",
      "Risk Mitigation",
      "Budgeting",
      "Team Coordination",
      "Reporting",
    ],
    softSkills: [
      "Leadership",
      "Communication",
      "Problem Solving",
      "Adaptability",
    ],
    certifications: ["PMP", "PRINCE2", "CSM", "PMI-ACP"],
    commonTools: [
      "MS Project",
      "Jira",
      "Asana",
      "Trello",
      "Monday.com",
      "Confluence",
      "Smartsheet",
    ],
    faqs: [
      {
        question: "What PM certifications improve ATS scores the most?",
        answer:
          'PMP (Project Management Professional) is the credential most often named in PM postings. PRINCE2 is preferred in UK/EU markets. CSM (Certified Scrum Master) is valuable for tech companies. List your certification acronym AND full name: "PMP – Project Management Professional."',
      },
    ],
    relatedRoles: [
      "business-analyst",
      "scrum-master",
      "program-manager",
      "product-manager",
    ],
    resumeTips: [
      'Lead with portfolio scale: "Managed $5M budget across 12 simultaneous projects"',
      'Show delivery rate: "Delivered 94% of projects on time over 3 years"',
    ],
    hiringCompanies: [
      "TCS",
      "Infosys",
      "Wipro",
      "L&T",
      "IBM",
      "Accenture",
      "Deloitte",
    ],
  },
  // ─── FINANCE ─────────────────────────────────────────────────────────────
  {
    slug: "financial-analyst",
    title: "Financial Analyst",
    category: "Finance",
    description:
      "Financial Analysts evaluate financial data, build models, and provide insights to guide business strategy, investment decisions, and budget planning.",
    salaryRange: {
      india: "₹6L – ₹20L",
      global: "$70K – $120K",
      currency: "INR/USD",
    },
    demandTrend: "stable",
    topKeywords: [
      { keyword: "Financial Modeling", importance: "critical" },
      { keyword: "DCF Analysis", importance: "critical" },
      { keyword: "Budgeting", importance: "critical" },
      { keyword: "Forecasting", importance: "high" },
      { keyword: "Variance Analysis", importance: "high" },
      { keyword: "Excel", importance: "high" },
      { keyword: "SQL", importance: "high" },
      { keyword: "P&L Management", importance: "high" },
      { keyword: "Power BI", importance: "medium" },
      { keyword: "Tableau", importance: "medium" },
      { keyword: "GAAP", importance: "medium" },
      { keyword: "Bloomberg", importance: "medium" },
      { keyword: "VBA", importance: "medium" },
    ],
    criticalSkills: [
      "Financial Modeling",
      "DCF Valuation",
      "Budget Analysis",
      "Data Visualization",
      "Reporting",
    ],
    softSkills: [
      "Analytical Thinking",
      "Attention to Detail",
      "Communication",
      "Time Management",
    ],
    certifications: ["CFA Level 1", "CPA", "FMVA (CFI)", "CA (India)"],
    commonTools: [
      "Excel",
      "Bloomberg",
      "FactSet",
      "Power BI",
      "SAP",
      "Oracle Financials",
    ],
    faqs: [
      {
        question:
          "What financial keywords guarantee an ATS pass for analyst roles?",
        answer:
          "Must-include: Financial Modeling, Discounted Cash Flow (DCF), Variance Analysis, Budget Forecasting, P&L, Excel (Advanced). Add industry-specific: GAAP/IFRS for accounting, Bloomberg/FactSet for IB, VBA for automation. Spell out all financial acronyms first use.",
      },
    ],
    relatedRoles: [
      "investment-banker",
      "data-analyst",
      "fp-and-a-analyst",
      "business-analyst",
    ],
    resumeTips: [
      'Include model complexity: "Built 3-statement LBO model for $50M acquisition"',
      'Show accuracy: "Forecasting variance <3% vs actuals for 8 consecutive quarters"',
    ],
    hiringCompanies: [
      "JP Morgan",
      "Goldman Sachs",
      "HDFC",
      "ICICI",
      "Kotak",
      "Deloitte",
      "EY",
      "KPMG",
    ],
  },
  // ─── MARKETING ───────────────────────────────────────────────────────────
  {
    slug: "digital-marketing-manager",
    title: "Digital Marketing Manager",
    category: "Marketing",
    description:
      "Digital Marketing Managers develop and execute multi-channel online marketing strategies to drive brand awareness, lead generation, and revenue growth.",
    salaryRange: {
      india: "₹8L – ₹25L",
      global: "$80K – $140K",
      currency: "INR/USD",
    },
    demandTrend: "high",
    topKeywords: [
      { keyword: "SEO", importance: "critical" },
      { keyword: "Performance Marketing", importance: "critical" },
      { keyword: "Google Ads", importance: "critical" },
      { keyword: "Meta Ads", importance: "high" },
      { keyword: "Email Marketing", importance: "high" },
      { keyword: "Marketing Automation", importance: "high" },
      { keyword: "Content Strategy", importance: "high" },
      { keyword: "Analytics", importance: "high" },
      { keyword: "A/B Testing", importance: "medium" },
      { keyword: "CAC", importance: "medium" },
      { keyword: "ROAS", importance: "medium" },
      { keyword: "CRM", importance: "medium" },
      { keyword: "HubSpot", importance: "medium" },
    ],
    criticalSkills: [
      "Paid Media",
      "SEO/SEM",
      "Analytics",
      "Campaign Management",
      "Funnel Optimization",
    ],
    softSkills: [
      "Creative Thinking",
      "Data Interpretation",
      "Cross-team Collaboration",
      "Copywriting",
    ],
    certifications: [
      "Google Ads Certified",
      "Meta Blueprint",
      "HubSpot Marketing Certified",
      "Google Analytics 4",
    ],
    commonTools: [
      "Google Analytics",
      "Google Ads",
      "SEMrush",
      "Ahrefs",
      "HubSpot",
      "Mailchimp",
      "Canva",
    ],
    faqs: [
      {
        question:
          "What digital marketing keywords rank highest in ATS for manager roles?",
        answer:
          'Core: SEO, Performance Marketing, Google Ads, Meta Ads (formally Facebook Ads), Email Marketing. Metrics that ATS systems flag positively: ROAS (Return on Ad Spend), CAC (Customer Acquisition Cost), CTR, conversion rate. Always quantify: "Achieved 4.2x ROAS on Google Ads with ₹50L monthly budget."',
      },
    ],
    relatedRoles: [
      "seo-specialist",
      "content-marketing-manager",
      "growth-hacker",
      "brand-manager",
    ],
    resumeTips: [
      'Include budget owned: "Managed ₹1.2Cr/month paid media across Google + Meta"',
      'Show growth metrics: "Grew organic traffic 180% in 6 months via technical SEO"',
    ],
    hiringCompanies: [
      "Nykaa",
      "Meesho",
      "CRED",
      "Bombay Shaving Company",
      "Lenskart",
      "OkCredit",
    ],
  },
  // ─── UX/DESIGN ───────────────────────────────────────────────────────────
  {
    slug: "ux-designer",
    title: "UX Designer",
    category: "Product & Design",
    description:
      "UX Designers create intuitive, user-centered digital experiences through research, wireframing, prototyping, and iterative design validated by user data.",
    salaryRange: {
      india: "₹8L – ₹28L",
      global: "$90K – $150K",
      currency: "INR/USD",
    },
    demandTrend: "high",
    topKeywords: [
      { keyword: "User Research", importance: "critical" },
      { keyword: "Wireframing", importance: "critical" },
      { keyword: "Prototyping", importance: "critical" },
      { keyword: "Figma", importance: "critical" },
      { keyword: "Design Systems", importance: "high" },
      { keyword: "Usability Testing", importance: "high" },
      { keyword: "Information Architecture", importance: "high" },
      { keyword: "Interaction Design", importance: "high" },
      { keyword: "Accessibility (WCAG)", importance: "medium" },
      { keyword: "A/B Testing", importance: "medium" },
      { keyword: "Design Thinking", importance: "medium" },
    ],
    criticalSkills: [
      "Figma",
      "User Research",
      "Prototyping",
      "Usability Testing",
      "Design Systems",
    ],
    softSkills: [
      "Empathy",
      "Communication",
      "Visual Storytelling",
      "Feedback Integration",
    ],
    certifications: [
      "Google UX Design Certificate",
      "Nielsen Norman UX Certified",
      "Interaction Design Foundation",
    ],
    commonTools: [
      "Figma",
      "FigJam",
      "Maze",
      "Hotjar",
      "Miro",
      "Notion",
      "Lottie",
    ],
    faqs: [
      {
        question: "What UX keywords improve ATS scores for design roles?",
        answer:
          "Lead with: Figma (required at most companies), User Research, Wireframing, Prototyping, Usability Testing. For senior roles: Design Systems, Design Tokens, Accessibility (WCAG 2.1), and Cross-platform Design. Include portfolio URL prominently — many ATS systems are now configured to detect portfolio links.",
      },
    ],
    relatedRoles: [
      "product-designer",
      "ui-designer",
      "ux-researcher",
      "product-manager",
    ],
    resumeTips: [
      "Link your portfolio prominently and ensure it's ATS-readable (URL, not embedded)",
      "Describe your design process per project, not just the output",
      'Include research methods: "Conducted 12 user interviews using Jobs-to-be-Done framework"',
    ],
    hiringCompanies: [
      "Flipkart",
      "Amazon",
      "Razorpay",
      "CRED",
      "Zomato",
      "PhonePe",
      "Swiggy",
    ],
  },
  // ─── DATA & ANALYTICS ────────────────────────────────────────────────────
  {
    slug: "data-analyst",
    title: "Data Analyst",
    category: "Data & Analytics",
    description:
      "Data Analysts transform raw data into business insights using SQL, Excel, and visualization tools to support strategic decisions across the organization.",
    salaryRange: {
      india: "₹5L – ₹18L",
      global: "$65K – $110K",
      currency: "INR/USD",
    },
    demandTrend: "very-high",
    topKeywords: [
      { keyword: "SQL", importance: "critical" },
      { keyword: "Python", importance: "high" },
      { keyword: "Excel", importance: "high" },
      { keyword: "Power BI", importance: "high" },
      { keyword: "Tableau", importance: "high" },
      { keyword: "Data Visualization", importance: "high" },
      { keyword: "Statistical Analysis", importance: "medium" },
      { keyword: "ETL", importance: "medium" },
      { keyword: "Dashboard", importance: "medium" },
      { keyword: "BigQuery", importance: "medium" },
      { keyword: "A/B Testing", importance: "medium" },
    ],
    criticalSkills: [
      "SQL (Advanced)",
      "Data Visualization",
      "Statistical Analysis",
      "Business Communication",
      "Excel/Sheets",
    ],
    softSkills: [
      "Critical Thinking",
      "Data Storytelling",
      "Attention to Detail",
      "Collaboration",
    ],
    certifications: [
      "Google Data Analytics Certificate",
      "Microsoft Power BI Data Analyst (PL-300)",
      "Tableau Specialist",
    ],
    commonTools: [
      "SQL",
      "Python",
      "Power BI",
      "Tableau",
      "Excel",
      "BigQuery",
      "Redshift",
      "dbt",
    ],
    faqs: [
      {
        question:
          "What are the top ATS keywords for a fresher Data Analyst resume in India?",
        answer:
          'For freshers: SQL (most critical), Excel, Python (Pandas/NumPy), Power BI or Tableau. Even basic SQL knowledge (SELECT, JOIN, GROUP BY, subqueries) should be listed explicitly. Add "Data Cleaning," "Statistical Analysis," and "Dashboard Creation" if you\'ve done any internship or project work.',
      },
    ],
    relatedRoles: [
      "data-scientist",
      "business-analyst",
      "business-intelligence-analyst",
      "financial-analyst",
    ],
    resumeTips: [
      'Show specific SQL complexity: "Wrote 200+ line SQL queries with multiple CTEs and window functions"',
      'Include dashboard metrics: "Built Power BI dashboard tracking $5M in weekly sales"',
    ],
    hiringCompanies: [
      "Flipkart",
      "Amazon",
      "Myntra",
      "MakeMyTrip",
      "OYO",
      "Paytm",
      "PolicyBazaar",
    ],
  },
  {
    slug: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    category: "Data & Analytics",
    description:
      "ML Engineers design, build, and deploy machine learning systems at scale, bridging the gap between data science research and production software engineering.",
    salaryRange: {
      india: "₹15L – ₹50L",
      global: "$130K – $210K",
      currency: "INR/USD",
    },
    demandTrend: "very-high",
    topKeywords: [
      { keyword: "MLOps", importance: "critical" },
      { keyword: "Model Deployment", importance: "critical" },
      { keyword: "Python", importance: "critical" },
      { keyword: "PyTorch", importance: "high" },
      { keyword: "TensorFlow", importance: "high" },
      { keyword: "Feature Store", importance: "high" },
      { keyword: "Kubernetes", importance: "high" },
      { keyword: "Model Serving", importance: "high" },
      { keyword: "LLM Fine-tuning", importance: "high" },
      { keyword: "RAG", importance: "high" },
      { keyword: "ONNX", importance: "medium" },
      { keyword: "Triton Inference Server", importance: "medium" },
      { keyword: "Airflow", importance: "medium" },
    ],
    criticalSkills: [
      "Model Development",
      "MLOps",
      "Model Optimization",
      "System Design for ML",
      "Distributed Training",
    ],
    softSkills: [
      "Research Orientation",
      "Systems Thinking",
      "Collaboration with Data Scientists",
      "Documentation",
    ],
    certifications: [
      "AWS ML Specialty",
      "GCP Professional ML Engineer",
      "TensorFlow Developer Certificate",
    ],
    commonTools: [
      "MLflow",
      "Weights & Biases",
      "Kubeflow",
      "SageMaker",
      "Vertex AI",
      "Triton",
      "vLLM",
    ],
    faqs: [
      {
        question: "How do I make my ML Engineer resume pass ATS in 2025?",
        answer:
          "The 2025 ML Engineer resume must include LLM-related keywords: LLM Fine-tuning, RAG (Retrieval Augmented Generation), Vector Databases, Transformers, and Prompt Engineering. Core MLOps keywords: Model Deployment, Feature Store, A/B Model Testing, Model Monitoring. Include specific frameworks: PyTorch, Hugging Face, LangChain.",
      },
    ],
    relatedRoles: [
      "data-scientist",
      "ai-engineer",
      "senior-software-engineer",
      "devops-engineer",
    ],
    resumeTips: [
      'Show production scale: "Serving 10M inference requests/day with <50ms p99 latency"',
      'Include model size/complexity: "Fine-tuned 7B parameter LLaMA 2 on domain data"',
    ],
    hiringCompanies: [
      "Google DeepMind",
      "Microsoft",
      "Sarvam AI",
      "Krutrim",
      "CoRover",
      "Fractal",
      "Mu Sigma",
    ],
  },
  // ─── HUMAN RESOURCES ────────────────────────────────────────────────────
  {
    slug: "hr-manager",
    title: "HR Manager",
    category: "Human Resources",
    description:
      "HR Managers oversee the full employee lifecycle, from talent acquisition and onboarding to performance management, compensation, and culture initiatives.",
    salaryRange: {
      india: "₹8L – ₹22L",
      global: "$75K – $130K",
      currency: "INR/USD",
    },
    demandTrend: "stable",
    topKeywords: [
      { keyword: "Talent Acquisition", importance: "critical" },
      { keyword: "Performance Management", importance: "critical" },
      { keyword: "HRIS", importance: "high" },
      { keyword: "Employee Relations", importance: "high" },
      { keyword: "Compensation & Benefits", importance: "high" },
      { keyword: "Onboarding", importance: "high" },
      { keyword: "Succession Planning", importance: "medium" },
      { keyword: "DEI", importance: "medium" },
      { keyword: "Labor Law", importance: "medium" },
      { keyword: "Attrition Management", importance: "medium" },
    ],
    criticalSkills: [
      "Recruitment",
      "HR Policy",
      "Performance Reviews",
      "Employee Engagement",
      "Compliance",
    ],
    softSkills: [
      "Empathy",
      "Confidentiality",
      "Communication",
      "Conflict Resolution",
    ],
    certifications: ["SHRM-CP", "PHR", "CHRP (India)", "XLRI HR Programs"],
    commonTools: [
      "Darwinbox",
      "Workday",
      "BambooHR",
      "GreytHR",
      "Keka",
      "LinkedIn Recruiter",
    ],
    faqs: [
      {
        question: "What HR keywords score highest in ATS systems?",
        answer:
          'Critical: Talent Acquisition, Performance Management, Employee Relations, HRIS (with specific software names). For HR tech companies: People Analytics, OKR Frameworks, Agile HR. Always include your HRIS platforms by name: "Workday, Darwinbox, GreytHR" — recruiters use these as filters.',
      },
    ],
    relatedRoles: [
      "talent-acquisition-specialist",
      "hr-business-partner",
      "chief-people-officer",
      "project-manager",
    ],
    resumeTips: [
      'Show hiring scale: "Built 200-person engineering team from 30 in 18 months"',
      'Include retention metrics: "Reduced attrition from 28% to 16% via engagement programs"',
    ],
    hiringCompanies: [
      "TCS",
      "Infosys",
      "Razorpay",
      "Byju's",
      "OYO",
      "Meesho",
      "Urban Company",
    ],
  },
  // ─── HEALTHCARE ──────────────────────────────────────────────────────────
  {
    slug: "healthcare-analyst",
    title: "Healthcare Data Analyst",
    category: "Healthcare",
    description:
      "Healthcare Data Analysts collect, process, and analyze clinical and operational data to improve patient outcomes, optimize workflows, and reduce costs.",
    salaryRange: {
      india: "₹5L – ₹16L",
      global: "$65K – $110K",
      currency: "INR/USD",
    },
    demandTrend: "high",
    topKeywords: [
      { keyword: "EHR/EMR", importance: "critical" },
      { keyword: "Clinical Data Analysis", importance: "critical" },
      { keyword: "HL7", importance: "high" },
      { keyword: "ICD-10", importance: "high" },
      { keyword: "HIPAA", importance: "high" },
      { keyword: "SQL", importance: "high" },
      { keyword: "Population Health", importance: "medium" },
      { keyword: "Healthcare KPIs", importance: "medium" },
      { keyword: "Epic", importance: "medium" },
      { keyword: "Tableau", importance: "medium" },
    ],
    criticalSkills: [
      "Clinical Data Analysis",
      "Regulatory Compliance",
      "SQL",
      "Data Visualization",
      "Healthcare Standards",
    ],
    softSkills: [
      "Patient-First Thinking",
      "Data Privacy",
      "Communication with Clinicians",
      "Attention to Detail",
    ],
    certifications: [
      "RHIA",
      "CPC (Medical Coding)",
      "Health Informatics Certificate",
    ],
    commonTools: [
      "Epic",
      "Cerner",
      "SQL Server",
      "Tableau",
      "Power BI",
      "Redshift",
    ],
    faqs: [
      {
        question:
          "What healthcare-specific keywords improve ATS scores for analysts?",
        answer:
          "Domain: EHR/EMR, HL7 FHIR, ICD-10/CPT Codes, HIPAA Compliance. Analytics: Clinical Quality Metrics, Healthcare KPIs, Population Health Management. Software: Epic, Cerner (name them explicitly). For hospital operations: Bed Management, Length of Stay (LOS), Readmission Rates.",
      },
    ],
    relatedRoles: [
      "data-analyst",
      "business-analyst",
      "public-health-analyst",
      "clinical-researcher",
    ],
    resumeTips: [
      "Mention specific EHR platforms worked on",
      'Show outcome: "Analysis led to 15% reduction in average length of stay"',
    ],
    hiringCompanies: [
      "Apollo Hospitals",
      "Fortis",
      "1mg",
      "PharmEasy",
      "MediBuddy",
      "Practo",
    ],
  },
  {
    slug: "software-architect",
    title: "Software Architect",
    category: "Technology",
    description:
      "Software Architects define high-level technical structures, select technologies, and establish coding standards to guide development teams in building scalable, maintainable systems.",
    salaryRange: {
      india: "₹35L – ₹90L",
      global: "$170K – $280K",
      currency: "INR/USD",
    },
    demandTrend: "high",
    topKeywords: [
      { keyword: "Solution Architecture", importance: "critical" },
      { keyword: "System Design", importance: "critical" },
      { keyword: "Cloud Architecture", importance: "critical" },
      { keyword: "Microservices Architecture", importance: "high" },
      { keyword: "Event-Driven Architecture", importance: "high" },
      { keyword: "API Gateway", importance: "high" },
      { keyword: "TOGAF", importance: "high" },
      { keyword: "Domain-Driven Design", importance: "medium" },
      { keyword: "Technical Governance", importance: "medium" },
      { keyword: "FinOps", importance: "medium" },
    ],
    criticalSkills: [
      "Architecture Patterns",
      "Technology Selection",
      "Security Architecture",
      "Scalability Design",
      "Documentation",
    ],
    softSkills: [
      "Technical Leadership",
      "Executive Communication",
      "Mentoring",
      "Facilitation",
    ],
    certifications: [
      "TOGAF 9.2",
      "AWS Solutions Architect Professional",
      "Google Cloud Architect Professional",
    ],
    commonTools: [
      "Lucidchart",
      "Miro",
      "ArchiMate",
      "Terraform",
      "AWS CDK",
      "Backstage",
    ],
    faqs: [
      {
        question:
          "What architecture keywords do senior technical ATS filters look for?",
        answer:
          'Must-have: Solution Architecture, Cloud Architecture (name your cloud), Microservices, API Design. For BFSI/Enterprise: TOGAF, Enterprise Architecture, Security Architecture. For startups/tech: Event-Driven, CQRS, Domain-Driven Design, Platform Engineering. Include scale indicators: "Designed system serving 50M users."',
      },
    ],
    relatedRoles: [
      "senior-software-engineer",
      "devops-engineer",
      "chief-technology-officer",
      "platform-engineer",
    ],
    resumeTips: [
      'Show decisions and their rationale: "Chose event-driven over REST for ordering system — reduced coupling by 60%"',
      'Include org impact: "Architecture review board lead for 150-person engineering org"',
    ],
    hiringCompanies: [
      "Amazon",
      "Google",
      "Goldman Sachs",
      "JP Morgan",
      "Razorpay",
      "Juspay",
      "Walmart Labs",
    ],
  },
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    category: "Technology",
    description:
      "AI Engineers build production AI systems, integrate LLMs into applications, develop AI pipelines, and deploy intelligent features at scale using modern AI tooling.",
    salaryRange: {
      india: "₹15L – ₹55L",
      global: "$130K – $220K",
      currency: "INR/USD",
    },
    demandTrend: "very-high",
    topKeywords: [
      { keyword: "LLM Integration", importance: "critical" },
      { keyword: "RAG", importance: "critical" },
      { keyword: "LangChain", importance: "critical" },
      { keyword: "Prompt Engineering", importance: "high" },
      { keyword: "Vector Database", importance: "high" },
      { keyword: "Fine-tuning", importance: "high" },
      { keyword: "Python", importance: "high" },
      { keyword: "FastAPI", importance: "high" },
      { keyword: "OpenAI API", importance: "high" },
      { keyword: "Embedding Models", importance: "medium" },
      { keyword: "LlamaIndex", importance: "medium" },
      { keyword: "Agentic AI", importance: "medium" },
      { keyword: "AI Safety", importance: "medium" },
    ],
    criticalSkills: [
      "LLM Application Development",
      "RAG Systems",
      "Prompt Engineering",
      "API Integration",
      "Model Evaluation",
    ],
    softSkills: [
      "First-Principles Thinking",
      "Rapid Prototyping",
      "Technical Writing",
      "Iterative Experimentation",
    ],
    certifications: [
      "DeepLearning.AI Short Courses",
      "Hugging Face Certifications",
      "LangChain Academy",
    ],
    commonTools: [
      "LangChain",
      "LlamaIndex",
      "Pinecone",
      "Weaviate",
      "FastAPI",
      "Streamlit",
      "Hugging Face",
      "Weights & Biases",
    ],
    faqs: [
      {
        question:
          "What are the hottest AI Engineer keywords for 2025 ATS systems?",
        answer:
          "The 2025 AI Engineer resume must include: RAG (Retrieval Augmented Generation), LLM Fine-tuning, Agentic AI, Multi-Agent Systems, LangGraph, Vector Databases (Pinecone, Weaviate, Chroma). Also critical: AI Observability, Guardrails, Evaluation Frameworks. The field moves fast — mirror exact terms from the JD.",
      },
      {
        question:
          "How important is showing shipped products vs research for AI Engineer roles?",
        answer:
          'Product-focused AI engineer roles heavily weight production deployments. Highlight: "Shipped RAG-based customer support bot handling 10K queries/day" over "Researched RAG techniques." Research experience matters most for AI lab roles at Google, Anthropic, or OpenAI.',
      },
    ],
    relatedRoles: [
      "machine-learning-engineer",
      "data-scientist",
      "senior-software-engineer",
      "devops-engineer",
    ],
    resumeTips: [
      'Quantify AI impact: "RAG chatbot reduced support tickets by 40%, saving $200K/yr"',
      "Show your AI stack explicitly: LangChain + GPT-4 + Pinecone + FastAPI",
      'Mention evaluation: "Built custom eval framework measuring hallucination rate <2%"',
    ],
    hiringCompanies: [
      "Anthropic",
      "OpenAI",
      "Google",
      "Microsoft",
      "Sarvam AI",
      "Krutrim",
      "Mad Street Den",
      "Observe.AI",
    ],
  },
];

export function getRoleBySlug(slug: string): Role | undefined {
  return roles.find((r) => r.slug === slug);
}

export function getRolesByCategory(category: string): Role[] {
  return roles.filter((r) => r.category === category);
}

export function getAllRoles(): Role[] {
  return roles;
}

export function getAllSlugs(): string[] {
  return roles.map((r) => r.slug);
}

export function getRelatedRoles(slug: string, limit = 4): Role[] {
  const role = getRoleBySlug(slug);
  if (!role) return [];
  return roles
    .filter((r) => role.relatedRoles.includes(r.slug))
    .slice(0, limit);
}

export function getDemandBadgeClasses(trend: Role["demandTrend"]): string {
  const map = {
    "very-high": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    high: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    stable: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    declining: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return map[trend];
}

export function getDemandColor(trend: Role["demandTrend"]): string {
  const colors = {
    "very-high": "text-emerald-400",
    high: "text-blue-400",
    stable: "text-yellow-400",
    declining: "text-red-400",
  };
  return colors[trend];
}

export function getDemandLabel(trend: Role["demandTrend"]): string {
  const labels = {
    "very-high": "🔥 Very High Demand",
    high: "📈 High Demand",
    stable: "📊 Stable",
    declining: "📉 Declining",
  };
  return labels[trend];
}
