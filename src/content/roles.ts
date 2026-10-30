// src/content/roles.ts
// Role guides. Each one is written for people applying to that job: what
// recruiters type into the ATS search box, how the strongest bullets read, and
// the mistakes we see most for that role. Keep it specific — generic advice
// belongs in the guides, not here.

export interface RoleGuide {
  slug: string;
  title: string;
  category: 'Engineering' | 'Data' | 'Product & Project' | 'Design' | 'Business';
  /** Under 155 characters, used as meta description. */
  summary: string;
  intro: string[];
  titles: string[];
  clusters: { name: string; note: string; terms: string[] }[];
  bullets: { weak: string; strong: string; why: string }[];
  mistakes: { title: string; body: string }[];
  certifications: string[];
  faqs: { q: string; a: string }[];
  related: string[];
}

export const ROLES: RoleGuide[] = [
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    category: 'Engineering',
    summary: 'The keywords recruiters search for software engineer roles, how to write bullets that prove impact, and the resume mistakes that cost interviews.',
    intro: [
      'Software engineer postings are the most keyword-dense job ads on the internet. A typical one names a language, a framework, a cloud, a database and a way of working — and the recruiter screening your application usually searches for two or three of those exact words before they read anything.',
      'That makes the job of your resume simple to describe and fiddly to do: name the tools you actually used, in the posting\'s spelling, inside bullets that show what you built and what changed because of it.',
    ],
    titles: ['Software Engineer', 'Software Developer', 'Software Development Engineer (SDE)', 'Application Developer', 'Programmer Analyst'],
    clusters: [
      { name: 'Languages', note: 'List the ones you could write in an interview tomorrow. Put your strongest first.', terms: ['Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'C++', 'C#'] },
      { name: 'Engineering practice', note: 'These are searched as phrases, so write them out in full at least once.', terms: ['System Design', 'Data Structures', 'Algorithms', 'Unit Testing', 'Code Review', 'CI/CD', 'Git'] },
      { name: 'Platforms', note: 'Name the specific cloud and services, not just "cloud".', terms: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Linux'] },
      { name: 'Architecture', note: 'Only claim the ones you can explain trade-offs for.', terms: ['REST APIs', 'Microservices', 'Distributed Systems', 'Event-Driven Architecture', 'SQL', 'NoSQL'] },
    ],
    bullets: [
      { weak: 'Worked on the payments service.', strong: 'Rebuilt the payments retry logic in Java and Kafka, cutting failed transactions from 2.1% to 0.4% across 3M monthly payments.', why: 'Names the tools, the system, and a measured result.' },
      { weak: 'Responsible for writing unit tests.', strong: 'Raised unit test coverage on the order service from 38% to 81% with JUnit and introduced a CI gate that blocks merges below 75%.', why: '"Unit test" and "CI" are both searchable, and the numbers show ownership.' },
      { weak: 'Helped migrate to the cloud.', strong: 'Migrated 14 services from on-prem VMs to AWS ECS with Terraform, reducing infrastructure cost by $9,400 a month.', why: 'Scale, tools and business outcome in one line.' },
    ],
    mistakes: [
      { title: 'A skills list longer than the experience section', body: 'Twenty-five technologies with no evidence reads as a keyword dump. Keep the list to what you\'d defend in an interview and make sure the important ones also appear in bullets.' },
      { title: 'Describing the team\'s work, not yours', body: '"The team launched a new API" doesn\'t tell anyone what you did. Use "I designed", "I owned", "I wrote" — or the verb alone — for your part.' },
      { title: 'Leaving out scale', body: 'Requests per second, users, data volume, latency, team size. Engineers are judged on the size of problems they\'ve handled; give the reader a number.' },
      { title: 'GitHub link with nothing behind it', body: 'If you link GitHub, pin two or three repositories with a README. An empty profile is worse than no link.' },
    ],
    certifications: ['AWS Certified Developer – Associate', 'AWS Certified Solutions Architect – Associate', 'Microsoft Azure Developer Associate (AZ-204)', 'Certified Kubernetes Application Developer (CKAD)'],
    faqs: [
      { q: 'Should a software engineer resume be one page?', a: 'Under about eight years of experience, one page is the norm and easier to skim. With more, two pages is fine as long as the first page carries your most relevant work.' },
      { q: 'Do I need a projects section?', a: 'If you\'re a student, career changer, or your job work is confidential, yes — two or three projects with the stack and a result. Experienced engineers can usually skip it.' },
    ],
    related: ['backend-engineer', 'frontend-engineer', 'full-stack-engineer'],
  },
  {
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    category: 'Engineering',
    summary: 'Frontend engineer resume keywords — React, TypeScript, performance, accessibility — with example bullets and the gaps recruiters notice first.',
    intro: [
      'Frontend roles have shifted from "build the page" to "own the product experience": performance budgets, accessibility, design systems and testing now show up in nearly every senior posting. Resumes that only list React and CSS look a level below where they are.',
      'Recruiters search for the framework first, then a second filter like TypeScript, Next.js or accessibility. Make sure each of those appears in a sentence about real work, not only in the skills line.',
    ],
    titles: ['Frontend Engineer', 'Front-End Developer', 'UI Engineer', 'JavaScript Developer', 'React Developer'],
    clusters: [
      { name: 'Core stack', note: 'Spell framework names the way the posting does: "React", "Next.js", "Vue".', terms: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'HTML', 'CSS'] },
      { name: 'Quality', note: 'Accessibility is increasingly a hard requirement — mention WCAG if you\'ve worked to it.', terms: ['Web Accessibility', 'WCAG', 'Unit Testing', 'Jest', 'Playwright', 'Cypress'] },
      { name: 'Performance', note: 'Use the vocabulary hiring managers use: Core Web Vitals, LCP, bundle size.', terms: ['Web Performance', 'Core Web Vitals', 'Code Splitting', 'Server-Side Rendering', 'Caching'] },
      { name: 'Collaboration', note: 'Shows you work well with design and product.', terms: ['Design Systems', 'Figma', 'Storybook', 'Component Library', 'A/B Testing'] },
    ],
    bullets: [
      { weak: 'Improved website speed.', strong: 'Cut Largest Contentful Paint from 4.2s to 1.9s on mobile by moving the product page to Next.js server rendering and lazy-loading below-the-fold images.', why: 'Uses the metric names managers search, and shows the technique.' },
      { weak: 'Built reusable components.', strong: 'Built a 60-component React and TypeScript design system in Storybook adopted by 5 product teams, removing 11,000 lines of duplicated UI code.', why: 'Scale of adoption is the real result of a design system.' },
      { weak: 'Made the site accessible.', strong: 'Led a WCAG 2.1 AA remediation across checkout — keyboard navigation, focus states, ARIA labels — closing 140 audit issues before the EU Accessibility Act deadline.', why: 'Specific standard, specific scope, real-world driver.' },
    ],
    mistakes: [
      { title: 'No TypeScript in the resume', body: 'Most production React codebases now use TypeScript. If you use it, say so in a bullet; if you don\'t, it\'s worth learning before you apply to senior roles.' },
      { title: 'Portfolio links that are broken or slow', body: 'A frontend portfolio that takes six seconds to load undercuts the whole application. Check every link on a phone before you send.' },
      { title: 'Listing jQuery and Bootstrap first', body: 'Fine to include, but leading with older tools dates the resume. Put the modern stack first.' },
    ],
    certifications: ['Meta Front-End Developer Professional Certificate', 'IAAP Web Accessibility Specialist (WAS)'],
    faqs: [
      { q: 'Should I include a portfolio link?', a: 'Yes, if it shows real work and loads quickly. Two or three strong pieces beat ten tutorials.' },
      { q: 'Is "front-end" or "frontend" correct?', a: 'Both are used. Match the posting\'s spelling in your headline; most search tools treat them as the same word anyway.' },
    ],
    related: ['full-stack-engineer', 'software-engineer', 'ux-designer'],
  },
  {
    slug: 'backend-engineer',
    title: 'Backend Engineer',
    category: 'Engineering',
    summary: 'Backend engineer resume keywords for APIs, databases, cloud and reliability, with before-and-after bullets that show scale and uptime.',
    intro: [
      'Backend postings are about systems that don\'t fall over: APIs, data stores, queues and the cloud underneath them. Recruiters filter by language and database first, then look for signals of scale — traffic, data volume, uptime.',
      'If your resume says "built APIs" without saying how many requests, what latency, or which database, it reads the same as a weekend project.',
    ],
    titles: ['Backend Engineer', 'Back-End Developer', 'Server-Side Engineer', 'API Engineer', 'Platform Engineer'],
    clusters: [
      { name: 'Languages & frameworks', note: 'Pair each language with its framework: "Python (FastAPI)", "Java (Spring Boot)".', terms: ['Python', 'Java', 'Go', 'Node.js', 'Spring Boot', 'Django', 'FastAPI'] },
      { name: 'Data', note: 'Name the actual databases. "SQL" alone is weaker than "PostgreSQL".', terms: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Kafka', 'Elasticsearch'] },
      { name: 'APIs & architecture', note: 'These terms are frequently required in the posting\'s first bullet.', terms: ['REST APIs', 'GraphQL', 'gRPC', 'Microservices', 'System Design', 'Distributed Systems'] },
      { name: 'Operations', note: 'Backend roles increasingly expect you to run what you build.', terms: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Monitoring', 'Incident Response'] },
    ],
    bullets: [
      { weak: 'Developed REST APIs.', strong: 'Designed and shipped 22 REST endpoints in Go serving 4,000 requests/second at p99 latency under 80 ms.', why: 'Throughput and latency are what backend reviewers look for.' },
      { weak: 'Optimised database queries.', strong: 'Rewrote the five slowest PostgreSQL queries and added composite indexes, cutting report generation from 40s to 1.5s.', why: 'Specific database, specific technique, before/after.' },
      { weak: 'Was on call.', strong: 'Took part in a 6-person on-call rotation; wrote runbooks and Datadog alerts that reduced mean time to recovery from 52 to 18 minutes.', why: 'Turns a duty into a measured improvement.' },
    ],
    mistakes: [
      { title: 'No numbers about load or data', body: 'Even rough figures help: "~2TB of events a day", "50k daily active users". Without them nobody can tell the size of what you built.' },
      { title: 'Hiding reliability work', body: 'On-call, incident reviews and observability are valued. Many engineers leave them off because they feel like chores.' },
      { title: 'Buzzword architecture', body: 'Claiming "microservices, event sourcing, CQRS" without context invites hard interview questions. Mention what you used and why.' },
    ],
    certifications: ['AWS Certified Solutions Architect – Associate', 'Google Professional Cloud Developer', 'Oracle Certified Professional: Java SE Developer'],
    faqs: [
      { q: 'Should I list every database I\'ve touched?', a: 'List the ones you\'ve designed schemas for or tuned. Mention others in a bullet if they were part of a real project.' },
      { q: 'How do I show system design skills on a resume?', a: 'Describe a decision and its result: "Split the monolith\'s billing module into a separate service with its own queue, which let us deploy billing changes daily instead of monthly."' },
    ],
    related: ['software-engineer', 'devops-engineer', 'data-engineer'],
  },
  {
    slug: 'full-stack-engineer',
    title: 'Full Stack Engineer',
    category: 'Engineering',
    summary: 'Full stack resume keywords across frontend, backend and cloud, plus how to show depth so you don\'t read as a generalist with no specialty.',
    intro: [
      'Full stack postings are wide by definition, and that\'s the trap: a resume that lists every layer equally can look shallow everywhere. Hiring managers want breadth with at least one area where you clearly go deep.',
      'The best full stack resumes describe features end to end — the UI, the API, the database change and the deploy — because that\'s the job.',
    ],
    titles: ['Full Stack Engineer', 'Full-Stack Developer', 'Software Engineer (Full Stack)', 'Web Developer', 'Product Engineer'],
    clusters: [
      { name: 'Frontend', note: 'Usually the first filter.', terms: ['React', 'TypeScript', 'Next.js', 'JavaScript', 'HTML', 'CSS'] },
      { name: 'Backend', note: 'Name the runtime and the framework.', terms: ['Node.js', 'Express', 'Python', 'Django', 'REST APIs', 'GraphQL'] },
      { name: 'Data & infrastructure', note: 'Shows you can ship to production on your own.', terms: ['PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'CI/CD', 'Firebase'] },
      { name: 'Product sense', note: 'Separates product engineers from ticket-takers.', terms: ['A/B Testing', 'Analytics', 'User Research', 'Agile', 'Stakeholder Management'] },
    ],
    bullets: [
      { weak: 'Built features for the web app.', strong: 'Shipped team invitations end to end — React UI, Node.js API, PostgreSQL schema and email worker — lifting team-account signups 23% in the first month.', why: 'Shows every layer and ties it to a business number.' },
      { weak: 'Worked with the database.', strong: 'Moved session storage from MongoDB to Redis, cutting dashboard load time by 600 ms for 80k daily users.', why: 'A concrete cross-layer performance win.' },
      { weak: 'Set up deployments.', strong: 'Set up GitHub Actions CI/CD with preview deployments for every pull request, taking release frequency from weekly to 4 times a day.', why: 'DevOps skill, framed as a team-speed result.' },
    ],
    mistakes: [
      { title: 'Equal weight to every technology', body: 'Pick a lead: "Full stack engineer, strongest in React and Node.js". It gives recruiters a reason to call you for a specific role.' },
      { title: 'Feature lists without outcomes', body: '"Built login, profile, settings" says nothing. Pick the two or three features that moved a metric and explain them.' },
    ],
    certifications: ['AWS Certified Developer – Associate', 'MongoDB Associate Developer'],
    faqs: [
      { q: 'Should I apply to frontend or backend roles with a full stack resume?', a: 'Yes, but reorder your skills and bullets so the matching side comes first. A two-minute edit per application makes a real difference to keyword match.' },
    ],
    related: ['frontend-engineer', 'backend-engineer', 'software-engineer'],
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'Engineering',
    summary: 'DevOps and SRE resume keywords — Kubernetes, Terraform, CI/CD, observability — and bullets that prove reliability and speed improvements.',
    intro: [
      'DevOps postings are among the most tool-specific in tech. Recruiters often search for an exact combination — "Kubernetes AND Terraform AND AWS" — so a missing tool name can hide an otherwise perfect resume.',
      'Beyond tools, strong DevOps resumes measure two things: how fast the team ships and how rarely things break. Deployment frequency, lead time, change failure rate and recovery time are the language of the field.',
    ],
    titles: ['DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Platform Engineer', 'Cloud Engineer', 'Infrastructure Engineer'],
    clusters: [
      { name: 'Containers & orchestration', note: 'Write "Kubernetes" in full at least once even if you say "k8s" day to day.', terms: ['Kubernetes', 'Docker', 'Helm', 'EKS', 'GKE', 'AKS'] },
      { name: 'Infrastructure as code', note: 'Name the tool and what it managed.', terms: ['Terraform', 'Ansible', 'CloudFormation', 'Pulumi', 'Infrastructure as Code'] },
      { name: 'Delivery', note: 'Mention the CI system by name.', terms: ['CI/CD', 'GitHub Actions', 'Jenkins', 'GitLab CI', 'Argo CD'] },
      { name: 'Reliability', note: 'SLOs and incident work are what separate senior candidates.', terms: ['Monitoring', 'Prometheus', 'Grafana', 'Datadog', 'Incident Response', 'SLOs'] },
    ],
    bullets: [
      { weak: 'Managed Kubernetes clusters.', strong: 'Ran 9 production EKS clusters (1,200 pods) and introduced Karpenter autoscaling, lowering compute spend 31%.', why: 'Scale, specific tooling, money saved.' },
      { weak: 'Improved the CI pipeline.', strong: 'Cut CI build time from 24 to 7 minutes with layer caching and parallel test shards in GitHub Actions, saving ~300 engineer-hours a month.', why: 'Translates pipeline work into team time.' },
      { weak: 'Handled outages.', strong: 'Defined SLOs for 12 customer-facing services and built Grafana burn-rate alerts; Sev-1 incidents fell from 7 to 2 per quarter.', why: 'Shows modern reliability practice with a measured result.' },
    ],
    mistakes: [
      { title: 'Tool lists without environments', body: '"Terraform" is stronger as "Terraform modules for 40 AWS accounts". Size and context matter.' },
      { title: 'Ignoring cost', body: 'Cloud cost reduction is one of the most valued DevOps outcomes right now. If you saved money, say how much.' },
      { title: 'Only "maintained" and "supported"', body: 'Those verbs hide improvements. Lead with what you changed.' },
    ],
    certifications: ['Certified Kubernetes Administrator (CKA)', 'HashiCorp Certified: Terraform Associate', 'AWS Certified DevOps Engineer – Professional', 'Google Professional Cloud DevOps Engineer'],
    faqs: [
      { q: 'Is DevOps the same as SRE on a resume?', a: 'They overlap heavily. If a posting says SRE, use "reliability", "SLOs" and "incident response" prominently; for DevOps, lead with delivery and automation.' },
      { q: 'Do certifications matter for DevOps roles?', a: 'More than in most engineering roles. CKA and Terraform Associate are commonly listed as preferred and are searchable keywords.' },
    ],
    related: ['backend-engineer', 'software-engineer', 'data-engineer'],
  },
  {
    slug: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data',
    summary: 'Data scientist resume keywords for modelling, experimentation and Python, with examples that connect models to business decisions.',
    intro: [
      'Data science postings split into two families: product analytics (experiments, metrics, SQL) and modelling (machine learning, Python, deployment). Read the posting carefully — the same title can mean very different jobs — and weight your resume toward the one being hired for.',
      'The most common gap we see is models without outcomes. "Built a random forest" is a method. What changed because of it is the result.',
    ],
    titles: ['Data Scientist', 'Applied Scientist', 'Product Data Scientist', 'Decision Scientist', 'Quantitative Analyst'],
    clusters: [
      { name: 'Languages & tools', note: 'Python and SQL are near-universal requirements.', terms: ['Python', 'SQL', 'R', 'Pandas', 'NumPy', 'scikit-learn', 'Jupyter'] },
      { name: 'Methods', note: 'Name methods you could explain on a whiteboard.', terms: ['Machine Learning', 'Statistics', 'Regression Analysis', 'Forecasting', 'A/B Testing', 'Causal Inference'] },
      { name: 'Deep learning & NLP', note: 'Only for postings that ask; otherwise it can look unfocused.', terms: ['Deep Learning', 'PyTorch', 'TensorFlow', 'Natural Language Processing', 'Large Language Models'] },
      { name: 'Communication', note: 'Data scientists are hired to change decisions.', terms: ['Data Visualization', 'Tableau', 'Stakeholder Management', 'Storytelling'] },
    ],
    bullets: [
      { weak: 'Built a churn prediction model.', strong: 'Built a gradient-boosted churn model (AUC 0.84) used by the retention team to target 12,000 at-risk accounts a month, reducing churn 1.8 points.', why: 'Model quality, who used it, and the business effect.' },
      { weak: 'Ran A/B tests.', strong: 'Designed and analysed 30+ A/B tests on onboarding with CUPED variance reduction; shipped winners worth an estimated $1.1M in annual revenue.', why: 'Volume, technique and value.' },
      { weak: 'Made dashboards for stakeholders.', strong: 'Replaced 14 ad-hoc reports with one Tableau dashboard of weekly product KPIs, now the agenda for the leadership review.', why: 'Shows influence, not just output.' },
    ],
    mistakes: [
      { title: 'Kaggle-only experience presented as work', body: 'Competitions are useful, but label them as projects. Recruiters notice when a "role" is actually a course.' },
      { title: 'Listing every algorithm you\'ve heard of', body: 'Twenty algorithms in a skills list is noise. List the families you use and show two or three in bullets.' },
      { title: 'No SQL', body: 'Almost every data science interview includes SQL. If it\'s not on your resume, many searches will skip you.' },
    ],
    certifications: ['AWS Certified Machine Learning – Specialty', 'Google Professional Machine Learning Engineer', 'Microsoft Azure Data Scientist Associate (DP-100)'],
    faqs: [
      { q: 'Should I include my thesis or publications?', a: 'If the role is research-leaning, yes, in a short Publications section. For product roles, one line in Education is enough.' },
      { q: 'How technical should a data scientist resume be?', a: 'Technical enough to pass a keyword search, plain enough that a hiring manager understands the business result in each bullet.' },
    ],
    related: ['data-analyst', 'machine-learning-engineer', 'data-engineer'],
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data',
    summary: 'Data analyst resume keywords — SQL, Excel, Power BI, Tableau — and bullets that show the decisions your analysis changed.',
    intro: [
      'Data analyst is one of the most applied-for job titles, which makes recruiter searches strict. SQL plus one visualisation tool (Tableau, Power BI or Looker) is the usual first filter, with Excel close behind.',
      'What lifts an analyst resume above the pile is evidence that someone acted on the work: a process changed, money was saved, a launch was stopped.',
    ],
    titles: ['Data Analyst', 'Business Intelligence Analyst', 'Reporting Analyst', 'Product Analyst', 'Operations Analyst'],
    clusters: [
      { name: 'Querying', note: 'Mention the SQL dialect or warehouse if the posting names one.', terms: ['SQL', 'PostgreSQL', 'BigQuery', 'Snowflake', 'MySQL'] },
      { name: 'Spreadsheets', note: 'Specific functions read stronger than "advanced Excel".', terms: ['Excel', 'Pivot Tables', 'VLOOKUP', 'Power Query', 'Google Sheets'] },
      { name: 'Visualisation', note: 'Match the tool the company uses; many postings name exactly one.', terms: ['Tableau', 'Power BI', 'Looker', 'Data Visualization', 'Dashboards'] },
      { name: 'Analysis', note: 'Shows you go beyond reporting.', terms: ['Data Analysis', 'Statistics', 'A/B Testing', 'Python', 'Forecasting', 'KPIs'] },
    ],
    bullets: [
      { weak: 'Created reports in Excel.', strong: 'Automated the weekly sales report with Power Query and pivot tables, saving the finance team 6 hours a week.', why: 'Tool specifics and time saved.' },
      { weak: 'Analysed customer data.', strong: 'Found in SQL that 40% of refunds came from one courier region; the switch to a new partner cut refund costs ₹18 lakh per quarter.', why: 'An insight, the action it drove, and the money.' },
      { weak: 'Built dashboards.', strong: 'Built a Power BI dashboard tracking 9 operations KPIs for 25 store managers, replacing emailed spreadsheets.', why: 'Who used it and what it replaced.' },
    ],
    mistakes: [
      { title: '"Advanced Excel" with no detail', body: 'Everyone writes it. Name what you do: pivot tables, XLOOKUP, Power Query, macros.' },
      { title: 'No business outcome', body: 'Analysis is valuable when it changes a decision. Say what happened next.' },
      { title: 'Listing both Tableau and Power BI at expert level', body: 'Possible, but rare. If you\'re stronger in one, say so — interviewers will test it.' },
    ],
    certifications: ['Google Data Analytics Professional Certificate', 'Microsoft Power BI Data Analyst (PL-300)', 'Tableau Desktop Specialist'],
    faqs: [
      { q: 'Do I need Python to be a data analyst?', a: 'Not always. SQL and a BI tool are the core. Python is increasingly listed as preferred, so add it if you use it.' },
      { q: 'How do I get a data analyst job with no experience?', a: 'Two or three public projects on real datasets, each with a question, a SQL query, a chart and a recommendation, plus a resume that lists them under Projects.' },
    ],
    related: ['data-scientist', 'business-analyst', 'data-engineer'],
  },
  {
    slug: 'data-engineer',
    title: 'Data Engineer',
    category: 'Data',
    summary: 'Data engineer resume keywords for pipelines, warehouses and streaming — Spark, Airflow, dbt, Snowflake — with bullets that show volume and reliability.',
    intro: [
      'Data engineering postings tend to name a precise stack: an orchestrator, a warehouse, a transformation tool and a cloud. Recruiters search for that combination, so the exact product names matter more here than in most roles.',
      'The strongest resumes give volume (rows, GB, events per second), freshness (how quickly data lands) and reliability (how often pipelines fail).',
    ],
    titles: ['Data Engineer', 'Analytics Engineer', 'Big Data Engineer', 'ETL Developer', 'Data Platform Engineer'],
    clusters: [
      { name: 'Processing', note: 'Batch and streaming are often both required.', terms: ['Spark', 'Kafka', 'Python', 'SQL', 'Scala', 'Flink'] },
      { name: 'Orchestration & transformation', note: 'dbt has become a common hard requirement.', terms: ['Airflow', 'dbt', 'ETL', 'Data Pipelines', 'Dagster'] },
      { name: 'Warehouses', note: 'Name the one(s) you\'ve run in production.', terms: ['Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'Data Warehousing'] },
      { name: 'Quality & governance', note: 'Senior roles look for these.', terms: ['Data Modeling', 'Data Quality', 'Great Expectations', 'Data Governance', 'AWS'] },
    ],
    bullets: [
      { weak: 'Built ETL pipelines.', strong: 'Built 40 Airflow DAGs moving 1.5 TB/day from Postgres and Kafka into Snowflake, with dbt models feeding 200 Looker dashboards.', why: 'Full stack of tools plus volume and reach.' },
      { weak: 'Fixed data quality issues.', strong: 'Added dbt tests and freshness checks to 120 models; data incidents reported by analysts dropped from 15 to 3 a month.', why: 'Quality work turned into a measurable result.' },
      { weak: 'Migrated to the cloud.', strong: 'Migrated a 9-year-old Hadoop cluster to Databricks on AWS, cutting nightly batch time from 7 hours to 50 minutes.', why: 'Before/after on a well-known migration.' },
    ],
    mistakes: [
      { title: 'Not separating batch and streaming', body: 'If you\'ve done both, show both. Many postings filter on streaming experience specifically.' },
      { title: 'Missing data modelling', body: 'Star schemas, slowly changing dimensions and dbt models show you think about the people using the data.' },
    ],
    certifications: ['Databricks Certified Data Engineer Associate', 'Google Professional Data Engineer', 'SnowPro Core Certification', 'AWS Certified Data Engineer – Associate'],
    faqs: [
      { q: 'What\'s the difference between a data engineer and an analytics engineer resume?', a: 'Analytics engineers lead with SQL, dbt and modelling for analysts. Data engineers lead with pipelines, infrastructure and scale.' },
    ],
    related: ['data-scientist', 'backend-engineer', 'data-analyst'],
  },
  {
    slug: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    category: 'Data',
    summary: 'ML engineer resume keywords for training, deployment and LLMs — PyTorch, MLOps, RAG — with bullets that show models running in production.',
    intro: [
      'Machine learning engineer roles sit between data science and backend engineering. Hiring managers look for one thing above all: models that ran in production and kept running. Research results without deployment read as a data scientist resume.',
      'Since 2024 most postings also ask about large language models — fine-tuning, retrieval-augmented generation, evaluation. If you\'ve shipped an LLM feature, put it near the top.',
    ],
    titles: ['Machine Learning Engineer', 'ML Engineer', 'AI Engineer', 'Applied ML Engineer', 'MLOps Engineer'],
    clusters: [
      { name: 'Frameworks', note: 'PyTorch is the most requested; list what you train with.', terms: ['Python', 'PyTorch', 'TensorFlow', 'scikit-learn', 'Hugging Face'] },
      { name: 'Production', note: 'This cluster is what makes it an engineering role.', terms: ['MLOps', 'Model Deployment', 'Docker', 'Kubernetes', 'AWS SageMaker', 'Feature Store'] },
      { name: 'LLMs', note: 'Name specific techniques, not just "AI".', terms: ['Large Language Models', 'Retrieval-Augmented Generation', 'Fine-Tuning', 'Prompt Engineering', 'Vector Databases', 'Evaluation'] },
      { name: 'Domains', note: 'Include only the ones relevant to the posting.', terms: ['Natural Language Processing', 'Computer Vision', 'Recommendation Systems', 'Deep Learning'] },
    ],
    bullets: [
      { weak: 'Worked on an LLM chatbot.', strong: 'Shipped a RAG support assistant on internal docs (pgvector + GPT-4o), with an evaluation set of 600 questions; it now resolves 34% of tickets without an agent.', why: 'Technique, evaluation and business effect.' },
      { weak: 'Deployed models.', strong: 'Moved 11 models from notebooks to a SageMaker pipeline with automated retraining and drift alerts, cutting model refresh from quarterly to weekly.', why: 'Classic MLOps result.' },
      { weak: 'Improved model accuracy.', strong: 'Raised search ranking NDCG@10 from 0.61 to 0.70 with a two-tower model, lifting click-through 9% in an A/B test.', why: 'Offline metric plus online validation.' },
    ],
    mistakes: [
      { title: 'Only offline metrics', body: 'Accuracy on a test set is half the story. Show latency, cost, and the online result.' },
      { title: '"AI" everywhere', body: 'Specific terms — RAG, fine-tuning, embeddings, evaluation — are what get searched. "AI-powered" isn\'t a skill.' },
    ],
    certifications: ['AWS Certified Machine Learning – Specialty', 'Google Professional Machine Learning Engineer', 'NVIDIA Deep Learning Institute certificates'],
    faqs: [
      { q: 'Should I list LLM projects if they\'re side projects?', a: 'Yes, in a Projects section with the stack and how you evaluated it. Evaluation is what most side projects skip and interviewers ask about.' },
    ],
    related: ['data-scientist', 'data-engineer', 'backend-engineer'],
  },
  {
    slug: 'product-manager',
    title: 'Product Manager',
    category: 'Product & Project',
    summary: 'Product manager resume keywords — roadmap, discovery, experimentation, stakeholder management — and bullets that show outcomes, not activity.',
    intro: [
      'Product manager resumes fail in a predictable way: they list activities ("ran standups, wrote PRDs, groomed backlog") instead of results. Recruiters for PM roles search for domain and method keywords, then look for evidence you moved a metric.',
      'Every bullet should answer: what problem, what you decided, what happened. If you can\'t share exact numbers, use percentages or ranges.',
    ],
    titles: ['Product Manager', 'Senior Product Manager', 'Product Owner', 'Technical Product Manager', 'Group Product Manager'],
    clusters: [
      { name: 'Strategy', note: 'Searched as exact phrases in most PM postings.', terms: ['Product Strategy', 'Product Roadmap', 'Go-to-Market', 'OKRs', 'Market Research'] },
      { name: 'Discovery', note: 'Shows you start from users, not from the backlog.', terms: ['User Research', 'Customer Discovery', 'Usability Testing', 'Personas', 'Jobs to Be Done'] },
      { name: 'Delivery', note: 'Expected, so keep it brief.', terms: ['Agile', 'Scrum', 'Jira', 'Requirements Gathering', 'Backlog Prioritization'] },
      { name: 'Data', note: 'Increasingly a hard requirement.', terms: ['A/B Testing', 'SQL', 'Data Analysis', 'Mixpanel', 'Amplitude', 'KPIs'] },
    ],
    bullets: [
      { weak: 'Managed the product roadmap.', strong: 'Reprioritised the onboarding roadmap around activation after 18 user interviews; 7-day activation rose from 31% to 44% in two quarters.', why: 'Discovery, decision, and outcome.' },
      { weak: 'Launched new features.', strong: 'Led the launch of usage-based pricing across 3 engineering teams, growing expansion revenue 27% year over year.', why: 'Cross-team scope with a revenue result.' },
      { weak: 'Worked with stakeholders.', strong: 'Aligned sales, support and legal on a data-retention feature required by enterprise buyers, unblocking $2.4M in pipeline.', why: '"Stakeholder management" shown, not claimed.' },
    ],
    mistakes: [
      { title: 'Taking credit for the whole team', body: 'Say "led" or "drove" for your part and name the team size. Interviewers will ask exactly what you did.' },
      { title: 'No metrics because "it\'s confidential"', body: 'Use relative numbers: "+18% conversion", "cut support tickets by a third".' },
      { title: 'Missing domain words', body: 'If the posting is B2B SaaS, payments or marketplaces, use those words. Domain experience is one of the strongest PM filters.' },
    ],
    certifications: ['Certified Scrum Product Owner (CSPO)', 'Pragmatic Institute certification', 'AIPMM Certified Product Manager'],
    faqs: [
      { q: 'Do product managers need technical skills on the resume?', a: 'For technical PM roles, yes — mention APIs, SQL, or the platform you worked on. For consumer PM roles, data and experimentation matter more.' },
      { q: 'Product manager or product owner — which title should I use?', a: 'Use your real title, and mirror the posting\'s title in your summary if it fairly describes your work.' },
    ],
    related: ['project-manager', 'business-analyst', 'ux-designer'],
  },
  {
    slug: 'project-manager',
    title: 'Project Manager',
    category: 'Product & Project',
    summary: 'Project manager resume keywords — PMP, Agile, risk, budget, stakeholders — with bullets that prove on-time, on-budget delivery.',
    intro: [
      'Project manager postings are filtered heavily on methodology and certification: PMP, PRINCE2, Agile, Scrum. If you hold a certification, put it in your headline as well as the certifications section — it\'s often the very first search.',
      'Beyond that, project management is judged on three numbers: budget, schedule and scope. Give at least one in every role.',
    ],
    titles: ['Project Manager', 'Technical Project Manager', 'Program Manager', 'Delivery Manager', 'PMO Analyst'],
    clusters: [
      { name: 'Methods', note: 'Match the posting\'s methodology exactly.', terms: ['Agile', 'Scrum', 'Waterfall', 'Kanban', 'PRINCE2', 'Hybrid'] },
      { name: 'Controls', note: 'These are the core of the job and should appear in bullets.', terms: ['Risk Management', 'Budget Management', 'Project Scheduling', 'Scope Management', 'Change Management'] },
      { name: 'People', note: 'Show the size and seniority of the groups you led.', terms: ['Stakeholder Management', 'Vendor Management', 'Cross-Functional Collaboration', 'Leadership'] },
      { name: 'Tools', note: 'Name what you plan and report in.', terms: ['Jira', 'MS Project', 'Smartsheet', 'Asana', 'Confluence'] },
    ],
    bullets: [
      { weak: 'Managed multiple projects.', strong: 'Delivered 6 concurrent ERP rollout projects ($4.2M total budget) on schedule, finishing 3% under budget.', why: 'Count, budget, schedule, result.' },
      { weak: 'Handled risks.', strong: 'Ran a weekly risk register with 12 vendors; early escalation of a hardware delay protected a fixed go-live date for 900 users.', why: 'Risk management shown through a real event.' },
      { weak: 'Coordinated with teams.', strong: 'Coordinated 45 people across engineering, finance and two vendors through a Scrum-of-Scrums cadence.', why: 'Scale and method.' },
    ],
    mistakes: [
      { title: 'Certifications buried at the bottom', body: 'PMP and PRINCE2 are filters. Put them next to your name or in the summary.' },
      { title: 'Only "coordinated"', body: 'Project managers make decisions. Use verbs like "re-planned", "escalated", "negotiated", "cut".' },
    ],
    certifications: ['Project Management Professional (PMP)', 'PRINCE2 Foundation / Practitioner', 'Certified ScrumMaster (CSM)', 'PMI Agile Certified Practitioner (PMI-ACP)', 'CAPM'],
    faqs: [
      { q: 'Is PMP required for project manager jobs?', a: 'Often preferred rather than required, but it is one of the most-searched credentials in the field. If you have it, make it impossible to miss.' },
    ],
    related: ['product-manager', 'business-analyst', 'qa-engineer'],
  },
  {
    slug: 'ux-designer',
    title: 'UX Designer',
    category: 'Design',
    summary: 'UX, UI and product designer resume keywords — Figma, research, prototyping, design systems — and how to pair a resume with your portfolio.',
    intro: [
      'Designers are often told the portfolio is all that matters. It isn\'t: the resume is what gets the portfolio opened. Recruiters search design resumes for tools (Figma), methods (user research, prototyping, usability testing) and the type of product you\'ve worked on.',
      'Design resumes also break ATS parsing more than any other kind, because designers make them beautiful. Keep the resume plain and let the portfolio carry the visual work.',
    ],
    titles: ['UX Designer', 'Product Designer', 'UI/UX Designer', 'Interaction Designer', 'UI Designer', 'UX Researcher'],
    clusters: [
      { name: 'Tools', note: 'Figma is near-universal; mention others only if the posting does.', terms: ['Figma', 'FigJam', 'Sketch', 'Adobe Creative Suite', 'Framer', 'Miro'] },
      { name: 'Research', note: 'Shows you design from evidence.', terms: ['User Research', 'Usability Testing', 'User Interviews', 'Journey Mapping', 'Personas'] },
      { name: 'Design', note: 'Use the posting\'s words: product design, interaction design, visual design.', terms: ['UX Design', 'UI Design', 'Interaction Design', 'Wireframing', 'Prototyping', 'Information Architecture'] },
      { name: 'Systems & delivery', note: 'Expected at mid-level and above.', terms: ['Design Systems', 'Web Accessibility', 'Responsive Design', 'A/B Testing', 'Developer Handoff'] },
    ],
    bullets: [
      { weak: 'Redesigned the checkout.', strong: 'Redesigned mobile checkout after 12 usability sessions, removing two steps; completion rose from 58% to 71%.', why: 'Research, design decision, measured outcome.' },
      { weak: 'Created a design system.', strong: 'Built a Figma design system of 90 components with tokens synced to code, cutting design-to-dev handoff time by half.', why: 'Scope and team-level benefit.' },
      { weak: 'Did user research.', strong: 'Ran 30 interviews with clinic staff that reshaped the appointment roadmap; the new scheduler cut no-shows 22%.', why: 'Research tied to a product change and result.' },
    ],
    mistakes: [
      { title: 'Two-column, graphic-heavy resumes', body: 'They often extract as scrambled text. Use a single column and put the visual craft in your portfolio.' },
      { title: 'Skill-rating bars', body: '"Figma ●●●●○" means nothing to an ATS or a person. List tools in plain text.' },
      { title: 'Portfolio link only in the header', body: 'Headers are sometimes skipped by parsers. Put the link in the body near the top too.' },
    ],
    certifications: ['Google UX Design Professional Certificate', 'Nielsen Norman Group UX Certification', 'IAAP CPACC (accessibility)'],
    faqs: [
      { q: 'UX designer, UI designer or product designer — which should I use?', a: 'Use your real title and mirror the posting\'s title in your summary. Product designer roles usually expect both UX and UI; UI roles focus on visual and interaction craft.' },
      { q: 'Should my resume be designed?', a: 'Tasteful type and spacing, yes. Columns, icons, images and skill bars, no — they cost you in ATS parsing.' },
    ],
    related: ['frontend-engineer', 'product-manager', 'marketing-manager'],
  },
  {
    slug: 'qa-engineer',
    title: 'QA Engineer',
    category: 'Engineering',
    summary: 'QA and test automation resume keywords — Selenium, Playwright, API testing, CI — with bullets that show defects caught and release speed.',
    intro: [
      'QA roles have split into manual testing and automation engineering, and postings are clear about which they want. Recruiters filter on framework names — Selenium, Playwright, Cypress, Appium — and on languages for automation roles.',
      'Strong QA resumes measure coverage, escaped defects and how testing changed release speed.',
    ],
    titles: ['QA Engineer', 'Software Development Engineer in Test (SDET)', 'Test Automation Engineer', 'Quality Assurance Analyst', 'QA Tester'],
    clusters: [
      { name: 'Automation frameworks', note: 'List the ones you\'ve built suites in, not just used.', terms: ['Selenium', 'Playwright', 'Cypress', 'Appium', 'TestNG', 'JUnit'] },
      { name: 'Languages', note: 'Automation roles filter on these.', terms: ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL'] },
      { name: 'Testing types', note: 'Write these out; they\'re searched as phrases.', terms: ['Test Automation', 'Regression Testing', 'API Testing', 'Performance Testing', 'Manual Testing', 'Test Cases'] },
      { name: 'Process', note: 'Shows you fit into how teams ship.', terms: ['CI/CD', 'Jira', 'Agile', 'Postman', 'JMeter', 'Quality Assurance'] },
    ],
    bullets: [
      { weak: 'Wrote automated tests.', strong: 'Built a Playwright regression suite of 420 tests running in GitHub Actions on every pull request, cutting the release sign-off from 3 days to 4 hours.', why: 'Framework, scale, and the release-speed result.' },
      { weak: 'Found bugs.', strong: 'Introduced risk-based test plans for payments; production defects in that area fell from 9 to 1 per quarter.', why: 'Escaped-defect reduction is the clearest QA metric.' },
      { weak: 'Did API testing.', strong: 'Automated 150 API contract tests with Postman and Newman, catching 3 breaking changes before release in the first month.', why: 'Concrete proof the work mattered.' },
    ],
    mistakes: [
      { title: 'Only manual testing words for an automation role', body: 'If you\'ve automated anything, lead with it and name the framework.' },
      { title: 'Counting test cases instead of results', body: '"Wrote 2,000 test cases" is effort. Pair it with defects prevented or time saved.' },
    ],
    certifications: ['ISTQB Certified Tester Foundation Level', 'ISTQB Advanced Test Automation Engineer', 'Certified Agile Tester'],
    faqs: [
      { q: 'Is ISTQB worth putting on a resume?', a: 'Yes — it\'s widely searched, especially by employers in Europe and India.' },
    ],
    related: ['software-engineer', 'devops-engineer', 'project-manager'],
  },
  {
    slug: 'business-analyst',
    title: 'Business Analyst',
    category: 'Business',
    summary: 'Business analyst resume keywords — requirements, process mapping, SQL, stakeholders — and bullets that show how your analysis changed a process.',
    intro: [
      'Business analyst postings sit between the business and the delivery team. Recruiters look for requirements and process language first (requirements gathering, user stories, process mapping), then data skills such as SQL or Excel.',
      'Your resume should show a chain: you found a problem, documented it so others could act, and something improved.',
    ],
    titles: ['Business Analyst', 'Business Systems Analyst', 'IT Business Analyst', 'Functional Consultant', 'Process Analyst'],
    clusters: [
      { name: 'Requirements', note: 'Core to every BA posting.', terms: ['Requirements Gathering', 'User Stories', 'Acceptance Criteria', 'Business Requirements', 'Use Cases'] },
      { name: 'Process', note: 'Name the notation if you use one.', terms: ['Process Mapping', 'BPMN', 'Process Improvement', 'Gap Analysis', 'Root Cause Analysis'] },
      { name: 'Data', note: 'Increasingly required; SQL is the common filter.', terms: ['SQL', 'Excel', 'Power BI', 'Tableau', 'Data Analysis'] },
      { name: 'Delivery', note: 'Shows how you work with teams.', terms: ['Agile', 'Scrum', 'Jira', 'Confluence', 'Stakeholder Management', 'UAT'] },
    ],
    bullets: [
      { weak: 'Gathered requirements.', strong: 'Ran 15 workshops with claims staff to document 80 user stories for a new claims portal, cutting average handling time 28% after launch.', why: 'Method, volume and the operational result.' },
      { weak: 'Mapped processes.', strong: 'Mapped the vendor-onboarding process in BPMN and removed 4 redundant approvals, reducing onboarding from 21 to 8 days.', why: 'Shows analysis turning into change.' },
      { weak: 'Supported UAT.', strong: 'Planned and led UAT with 30 business users across 3 regions, closing 112 defects before go-live.', why: 'Scope and ownership.' },
    ],
    mistakes: [
      { title: 'Vague "liaised with stakeholders"', body: 'Say who, how many, and what decision came out of it.' },
      { title: 'No domain', body: 'Banking, insurance, healthcare, retail — domain knowledge is a major BA filter. Name yours.' },
    ],
    certifications: ['IIBA ECBA / CCBA / CBAP', 'PMI Professional in Business Analysis (PMI-PBA)', 'Certified Scrum Product Owner (CSPO)'],
    faqs: [
      { q: 'Do business analysts need SQL?', a: 'More and more postings list it. Even basic querying is worth showing in a bullet.' },
    ],
    related: ['data-analyst', 'project-manager', 'product-manager'],
  },
  {
    slug: 'marketing-manager',
    title: 'Marketing Manager',
    category: 'Business',
    summary: 'Marketing manager resume keywords for SEO, paid media, lifecycle and analytics, with bullets that tie campaigns to pipeline and revenue.',
    intro: [
      'Marketing postings range from brand to performance to product marketing, and each uses its own vocabulary. Recruiters search for channel names (SEO, paid search, email, social) and tool names (Google Ads, HubSpot, GA4), then look for revenue or pipeline numbers.',
      'Spell out acronyms once — "Search Engine Optimization (SEO)" — because recruiters search both forms.',
    ],
    titles: ['Marketing Manager', 'Digital Marketing Manager', 'Growth Marketing Manager', 'Performance Marketing Manager', 'Product Marketing Manager'],
    clusters: [
      { name: 'Channels', note: 'Lead with the channels the posting names.', terms: ['Search Engine Optimization (SEO)', 'Search Engine Marketing (SEM)', 'Email Marketing', 'Social Media Marketing', 'Content Marketing'] },
      { name: 'Paid media', note: 'Name the platforms and budgets you managed.', terms: ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'Performance Marketing', 'Paid Social'] },
      { name: 'Tools', note: 'CRMs and automation are frequent hard requirements.', terms: ['HubSpot', 'Salesforce', 'Google Analytics', 'Marketing Automation', 'Klaviyo'] },
      { name: 'Measurement', note: 'Senior roles are judged on these numbers.', terms: ['Marketing Analytics', 'Attribution', 'CAC', 'ROAS', 'Conversion Rate Optimization', 'A/B Testing'] },
    ],
    bullets: [
      { weak: 'Ran Google Ads campaigns.', strong: 'Managed a $60k/month Google Ads and Meta budget, cutting CAC 24% while growing paid signups 40% year over year.', why: 'Budget, platforms, efficiency and growth.' },
      { weak: 'Handled SEO.', strong: 'Rebuilt the content strategy around 120 high-intent keywords; organic traffic grew from 18k to 95k monthly visits in 10 months.', why: 'Strategy plus a clear traffic result.' },
      { weak: 'Sent email campaigns.', strong: 'Built HubSpot lifecycle flows for trial users that lifted trial-to-paid conversion from 9% to 13%.', why: 'Tool, method and revenue effect.' },
    ],
    mistakes: [
      { title: 'Vanity metrics', body: 'Impressions and followers are weaker than signups, pipeline and revenue. Use the metric closest to money.' },
      { title: 'No budget figures', body: 'Budget managed is one of the quickest signals of seniority. Include it.' },
    ],
    certifications: ['Google Ads Certification', 'Google Analytics Certification', 'HubSpot Inbound Marketing Certification', 'Meta Certified Digital Marketing Associate'],
    faqs: [
      { q: 'Should I list every marketing tool I\'ve used?', a: 'List the ones in the posting and the ones you\'ve managed day to day. Long tool lists are less convincing than one strong bullet.' },
    ],
    related: ['sales-executive', 'product-manager', 'ux-designer'],
  },
  {
    slug: 'sales-executive',
    title: 'Sales Executive',
    category: 'Business',
    summary: 'Sales resume keywords — quota, pipeline, CRM, B2B, negotiation — and how to present attainment numbers that recruiters screen for.',
    intro: [
      'Sales resumes are screened on numbers more than any other kind. Recruiters want quota attainment, deal size, sales cycle and the segment you sold into, usually within the first few lines.',
      'Keywords still matter — CRM names, B2B or B2C, SaaS, the sales methodology — but they confirm fit after the numbers have earned attention.',
    ],
    titles: ['Sales Executive', 'Account Executive', 'Business Development Executive', 'Sales Development Representative (SDR)', 'Inside Sales Representative'],
    clusters: [
      { name: 'Results', note: 'Searched as phrases and expected as numbers.', terms: ['Quota Attainment', 'Revenue Growth', 'Pipeline Management', 'Sales Forecasting', 'New Business'] },
      { name: 'Motion', note: 'Match the segment and model in the posting.', terms: ['B2B Sales', 'SaaS', 'Enterprise Sales', 'Prospecting', 'Account Management'] },
      { name: 'Skills', note: 'Show them through deals, not adjectives.', terms: ['Negotiation', 'Consultative Selling', 'Cold Calling', 'Closing', 'Relationship Building'] },
      { name: 'Tools', note: 'CRM is nearly always required.', terms: ['Salesforce', 'HubSpot', 'CRM', 'LinkedIn Sales Navigator', 'Outreach'] },
    ],
    bullets: [
      { weak: 'Exceeded targets.', strong: 'Closed $1.3M in new ARR in FY25 — 128% of quota — ranking 2nd of 18 account executives.', why: 'Amount, attainment and rank in one line.' },
      { weak: 'Generated leads.', strong: 'Booked 160 qualified meetings in 12 months through outbound sequences in Outreach and Sales Navigator, sourcing $2.1M in pipeline.', why: 'Activity tied to pipeline value.' },
      { weak: 'Managed key accounts.', strong: 'Grew a book of 35 mid-market accounts from $900k to $1.4M ARR with 96% gross retention.', why: 'Shows growth and retention.' },
    ],
    mistakes: [
      { title: 'No quota numbers', body: 'If you can\'t share revenue, use percentage of quota and ranking. Leaving them out makes recruiters assume the worst.' },
      { title: 'Generic "excellent communicator"', body: 'Every sales resume says it. Replace adjectives with results.' },
    ],
    certifications: ['Salesforce Certified Administrator', 'HubSpot Sales Software Certification', 'MEDDIC / Challenger training'],
    faqs: [
      { q: 'What if I missed quota one year?', a: 'Show your best periods and multi-year totals honestly. Never invent numbers — references and offer checks often verify them.' },
    ],
    related: ['marketing-manager', 'business-analyst', 'human-resources-manager'],
  },
  {
    slug: 'human-resources-manager',
    title: 'HR Manager',
    category: 'Business',
    summary: 'HR manager resume keywords — talent acquisition, HRIS, employee relations, compliance — with bullets that show retention and hiring results.',
    intro: [
      'HR postings are filtered on function (recruiting, employee relations, compensation, L&D), systems (Workday, SuccessFactors, BambooHR) and the size of the workforce you\'ve supported.',
      'HR people know ATS software better than most applicants — which means they also notice keyword stuffing. Be precise and back claims with numbers: time to hire, attrition, engagement scores.',
    ],
    titles: ['HR Manager', 'Human Resources Business Partner (HRBP)', 'People Operations Manager', 'Talent Acquisition Manager', 'HR Generalist'],
    clusters: [
      { name: 'Talent', note: 'Mention the volume and type of hiring.', terms: ['Recruiting', 'Talent Acquisition', 'Onboarding', 'Workforce Planning', 'Employer Branding'] },
      { name: 'People', note: 'Shows breadth across the employee lifecycle.', terms: ['Employee Relations', 'Performance Management', 'Learning and Development', 'Employee Engagement', 'Diversity and Inclusion'] },
      { name: 'Rewards & compliance', note: 'Mention the jurisdictions you\'ve worked in.', terms: ['Compensation and Benefits', 'Payroll', 'Employment Law', 'Compliance', 'HR Policies'] },
      { name: 'Systems', note: 'HRIS names are common hard requirements.', terms: ['HRIS', 'Workday', 'SuccessFactors', 'BambooHR', 'Applicant Tracking Systems'] },
    ],
    bullets: [
      { weak: 'Handled recruitment.', strong: 'Hired 140 people in 12 months across engineering and sales, cutting average time to hire from 52 to 31 days.', why: 'Volume, functions and speed.' },
      { weak: 'Worked on retention.', strong: 'Introduced stay interviews and a manager-coaching programme; first-year attrition fell from 28% to 17%.', why: 'Initiative and measured effect.' },
      { weak: 'Managed HR systems.', strong: 'Led the BambooHR implementation for 600 employees, moving leave, onboarding and reviews off spreadsheets in 10 weeks.', why: 'System, scale and timeline.' },
    ],
    mistakes: [
      { title: 'Listing duties instead of programmes', body: 'HR managers are hired to build things — policies, programmes, processes. Name what you built.' },
      { title: 'Ignoring headcount', body: 'Always say how many employees you supported. It\'s the main signal of scope.' },
    ],
    certifications: ['SHRM-CP / SHRM-SCP', 'CIPD Level 5 / Level 7', 'HRCI PHR / SPHR', 'Workday HCM certification'],
    faqs: [
      { q: 'Should HR resumes mention employment law?', a: 'Yes, with the country or state. Compliance experience is jurisdiction-specific and recruiters filter on it.' },
    ],
    related: ['business-analyst', 'project-manager', 'sales-executive'],
  },
];

export const ROLE_REDIRECTS: Record<string, string> = {
  'ui-designer': 'ux-designer',
  'product-designer': 'ux-designer',
};

export function getRole(slug: string): RoleGuide | undefined {
  return ROLES.find((r) => r.slug === slug);
}
