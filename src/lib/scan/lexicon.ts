// src/lib/scan/lexicon.ts
// Curated skill vocabulary. Each entry maps one canonical name to the ways the
// same thing is written in job ads and resumes, so "k8s" on a resume counts
// for "Kubernetes" in the posting. Aliases are lowercase.
//
// Categories:
//   hard  — tools, languages, platforms, techniques, domain skills
//   cert  — certifications and licences
//   soft  — interpersonal skills (weighted lower: recruiters rarely search them)

export type KeywordKind = 'hard' | 'cert' | 'soft';

export interface LexEntry {
  name: string;
  kind: KeywordKind;
  /** Matched case-insensitively on whole words. */
  aliases: string[];
  /** Matched only with this exact casing (for words like "Go", "R", "Excel" that are also ordinary English). */
  cased?: string[];
}

/**
 * Names that are also everyday words. Their lowercase form is never used as an
 * alias; only the exact-cased form counts.
 */
const AMBIGUOUS: Record<string, string[]> = {
  R: ['R'],
  Go: ['Go'],
  Swift: ['Swift'],
  Rust: ['Rust'],
  Express: ['Express', 'Express.js'],
  Excel: ['Excel'],
  CA: ['CA'],
  'Spring Boot': ['Spring'],
  'Lean Six Sigma': ['Lean'],
  'Node.js': ['Node'],
  'Microsoft Office': ['Word', 'Outlook'],
  'Accounts Payable': ['AP'],
  'Accounts Receivable': ['AR'],
  'General Ledger': ['GL'],
  'Public Relations': ['PR'],
  'Registered Nurse (RN)': ['RN'],
  'Electronic Health Records': ['Epic'],
  Sketch: ['Sketch'],
};

function entry(kind: KeywordKind, name: string, aliases: string[]): LexEntry {
  const cased = AMBIGUOUS[name];
  const all = cased ? aliases : [name.toLowerCase(), ...aliases];
  return { name, kind, aliases: Array.from(new Set(all)), cased };
}
const h = (name: string, ...aliases: string[]) => entry('hard', name, aliases);
const c = (name: string, ...aliases: string[]) => entry('cert', name, aliases);
const s = (name: string, ...aliases: string[]) => entry('soft', name, aliases);

export const LEXICON: LexEntry[] = [
  // ── Programming languages ──────────────────────────────────────────────
  h('JavaScript', 'javascript', 'js', 'ecmascript', 'es6'),
  h('TypeScript', 'typescript'),
  h('Python', 'python', 'python3'),
  h('Java', 'java'),
  h('C#', 'c#', 'c sharp', 'csharp'),
  h('C++', 'c++', 'cpp'),
  h('Go', 'golang', 'go lang'),
  h('Rust', 'rust'),
  h('Ruby', 'ruby'),
  h('PHP', 'php'),
  h('Kotlin', 'kotlin'),
  h('Swift', 'swift'),
  h('Scala', 'scala'),
  h('R', 'r programming', 'rstudio', 'r language'),
  h('SQL', 'sql', 't-sql', 'tsql', 'pl/sql', 'plsql'),
  h('Bash', 'bash', 'shell scripting', 'shell script'),
  h('Dart', 'dart'),
  h('HTML', 'html', 'html5'),
  h('CSS', 'css', 'css3', 'scss', 'sass'),
  h('MATLAB', 'matlab'),
  h('VBA', 'vba', 'excel macros'),

  // ── Frontend / mobile ──────────────────────────────────────────────────
  h('React', 'react', 'react.js', 'reactjs'),
  h('Next.js', 'next.js', 'nextjs'),
  h('Vue', 'vue', 'vue.js', 'vuejs'),
  h('Angular', 'angular', 'angularjs'),
  h('Svelte', 'svelte', 'sveltekit'),
  h('Redux', 'redux'),
  h('Tailwind CSS', 'tailwind', 'tailwindcss'),
  h('React Native', 'react native'),
  h('Flutter', 'flutter'),
  h('iOS', 'ios development', 'ios'),
  h('Android', 'android development', 'android'),
  h('SwiftUI', 'swiftui'),
  h('Jetpack Compose', 'jetpack compose'),
  h('Webpack', 'webpack'),
  h('Vite', 'vite'),
  h('Responsive Design', 'responsive design', 'responsive web design', 'mobile-first'),
  h('Web Accessibility', 'accessibility', 'wcag', 'a11y', 'web accessibility'),
  h('Web Performance', 'web performance', 'core web vitals', 'page speed', 'performance optimization'),

  // ── Backend / architecture ─────────────────────────────────────────────
  h('Node.js', 'node.js', 'nodejs'),
  h('Express', 'expressjs'),
  h('Django', 'django'),
  h('Flask', 'flask'),
  h('FastAPI', 'fastapi'),
  h('Spring Boot', 'spring boot', 'spring framework'),
  h('.NET', '.net', 'dotnet', 'asp.net', '.net core'),
  h('Ruby on Rails', 'rails', 'ruby on rails'),
  h('Laravel', 'laravel'),
  h('REST APIs', 'restful', 'rest api', 'rest apis', 'restful apis'),
  h('GraphQL', 'graphql'),
  h('gRPC', 'grpc'),
  h('Microservices', 'microservices', 'microservice architecture', 'micro-services'),
  h('System Design', 'system design', 'distributed systems', 'scalable systems'),
  h('Event-Driven Architecture', 'event-driven', 'event driven architecture'),
  h('Object-Oriented Programming', 'oop', 'object-oriented', 'object oriented programming'),
  h('Data Structures', 'data structures'),
  h('Algorithms', 'algorithms'),
  h('Unit Testing', 'unit testing', 'unit tests', 'tdd', 'test-driven development'),
  h('Jest', 'jest'),
  h('Cypress', 'cypress'),
  h('Playwright', 'playwright'),
  h('Selenium', 'selenium'),
  h('Git', 'git', 'github', 'gitlab', 'version control', 'bitbucket'),

  // ── Databases ──────────────────────────────────────────────────────────
  h('PostgreSQL', 'postgresql', 'postgres'),
  h('MySQL', 'mysql'),
  h('MongoDB', 'mongodb', 'mongo'),
  h('Redis', 'redis'),
  h('Elasticsearch', 'elasticsearch', 'elastic search', 'opensearch'),
  h('DynamoDB', 'dynamodb'),
  h('Cassandra', 'cassandra'),
  h('Oracle Database', 'oracle db', 'oracle database'),
  h('SQL Server', 'sql server', 'mssql', 'microsoft sql server'),
  h('Firebase', 'firebase', 'firestore'),
  h('NoSQL', 'nosql'),
  h('Database Design', 'database design', 'data modeling', 'data modelling', 'schema design'),

  // ── Cloud / DevOps ─────────────────────────────────────────────────────
  h('AWS', 'aws', 'amazon web services'),
  h('Microsoft Azure', 'azure', 'microsoft azure'),
  h('Google Cloud', 'gcp', 'google cloud', 'google cloud platform'),
  h('Docker', 'docker', 'containers', 'containerization'),
  h('Kubernetes', 'kubernetes', 'k8s', 'eks', 'aks', 'gke'),
  h('Terraform', 'terraform'),
  h('Ansible', 'ansible'),
  h('CI/CD', 'ci/cd', 'ci cd', 'continuous integration', 'continuous delivery', 'continuous deployment'),
  h('Jenkins', 'jenkins'),
  h('GitHub Actions', 'github actions'),
  h('Linux', 'linux', 'unix'),
  h('Infrastructure as Code', 'infrastructure as code', 'iac'),
  h('Monitoring', 'monitoring', 'observability', 'prometheus', 'grafana', 'datadog', 'new relic'),
  h('Site Reliability Engineering', 'sre', 'site reliability'),
  h('Serverless', 'serverless', 'aws lambda', 'lambda', 'cloud functions'),
  h('Networking', 'networking', 'tcp/ip', 'dns', 'load balancing'),
  h('Cybersecurity', 'cybersecurity', 'information security', 'infosec', 'security engineering'),
  h('SIEM', 'siem', 'splunk', 'sentinel'),
  h('Penetration Testing', 'penetration testing', 'pen testing', 'pentesting', 'ethical hacking'),
  h('Identity and Access Management', 'iam', 'identity and access management', 'sso', 'okta'),
  h('Incident Response', 'incident response', 'incident management'),

  // ── Data / ML ──────────────────────────────────────────────────────────
  h('Machine Learning', 'machine learning', 'ml'),
  h('Deep Learning', 'deep learning', 'neural networks'),
  h('Natural Language Processing', 'nlp', 'natural language processing'),
  h('Computer Vision', 'computer vision', 'image recognition'),
  h('Large Language Models', 'llm', 'llms', 'large language models', 'generative ai', 'genai', 'gen ai'),
  h('Prompt Engineering', 'prompt engineering'),
  h('Retrieval-Augmented Generation', 'rag', 'retrieval augmented generation', 'retrieval-augmented generation'),
  h('PyTorch', 'pytorch'),
  h('TensorFlow', 'tensorflow', 'keras'),
  h('scikit-learn', 'scikit-learn', 'sklearn'),
  h('Pandas', 'pandas'),
  h('NumPy', 'numpy'),
  h('Spark', 'spark', 'apache spark', 'pyspark'),
  h('Hadoop', 'hadoop', 'hive'),
  h('Kafka', 'kafka', 'apache kafka'),
  h('Airflow', 'airflow', 'apache airflow'),
  h('dbt', 'dbt'),
  h('Snowflake', 'snowflake'),
  h('BigQuery', 'bigquery'),
  h('Databricks', 'databricks'),
  h('Redshift', 'redshift'),
  h('ETL', 'etl', 'elt', 'data pipelines', 'data pipeline'),
  h('Data Warehousing', 'data warehouse', 'data warehousing'),
  h('MLOps', 'mlops', 'model deployment', 'ml ops'),
  h('Statistics', 'statistics', 'statistical analysis', 'statistical modeling', 'statistical modelling'),
  h('A/B Testing', 'a/b testing', 'ab testing', 'a/b tests', 'experimentation', 'split testing'),
  h('Regression Analysis', 'regression', 'regression analysis'),
  h('Forecasting', 'forecasting', 'time series'),
  h('Data Analysis', 'data analysis', 'data analytics', 'analysing data', 'analyzing data'),
  h('Data Visualization', 'data visualization', 'data visualisation', 'dashboards', 'dashboarding'),
  h('Tableau', 'tableau'),
  h('Power BI', 'power bi', 'powerbi'),
  h('Looker', 'looker', 'looker studio'),
  h('Excel', 'microsoft excel', 'ms excel', 'spreadsheets'),
  h('Pivot Tables', 'pivot tables', 'pivot table', 'vlookup', 'xlookup'),
  h('Google Analytics', 'google analytics', 'ga4'),
  h('Mixpanel', 'mixpanel', 'amplitude'),
  h('Jupyter', 'jupyter', 'jupyter notebooks'),

  // ── Product / project ──────────────────────────────────────────────────
  h('Agile', 'agile', 'agile methodology'),
  h('Scrum', 'scrum', 'sprint planning'),
  h('Kanban', 'kanban'),
  h('Jira', 'jira'),
  h('Confluence', 'confluence'),
  h('Asana', 'asana'),
  h('Product Strategy', 'product strategy', 'product vision'),
  h('Product Roadmap', 'roadmap', 'roadmapping', 'product roadmap'),
  h('User Research', 'user research', 'customer research', 'user interviews', 'customer discovery'),
  h('Requirements Gathering', 'requirements gathering', 'requirements analysis', 'business requirements', 'prd'),
  h('Go-to-Market', 'go-to-market', 'gtm', 'go to market', 'product launch'),
  h('OKRs', 'okrs', 'okr', 'kpis', 'kpi'),
  h('Stakeholder Management', 'stakeholder management', 'stakeholder engagement', 'managing stakeholders'),
  h('Project Management', 'project management', 'project delivery'),
  h('Program Management', 'program management', 'programme management'),
  h('Risk Management', 'risk management', 'risk assessment', 'risk mitigation'),
  h('Budget Management', 'budgeting', 'budget management', 'budget planning'),
  h('Change Management', 'change management'),
  h('Process Improvement', 'process improvement', 'process optimization', 'continuous improvement'),
  h('Lean Six Sigma', 'six sigma', 'lean manufacturing', 'lean six sigma', 'kaizen'),
  h('Vendor Management', 'vendor management', 'supplier management', 'procurement'),
  h('Business Analysis', 'business analysis'),
  h('Process Mapping', 'process mapping', 'bpmn', 'workflow design'),

  // ── Design ─────────────────────────────────────────────────────────────
  h('Figma', 'figma'),
  h('Sketch', 'sketch app', 'sketchapp'),
  h('Adobe Creative Suite', 'adobe creative suite', 'adobe creative cloud', 'photoshop', 'illustrator', 'indesign', 'after effects', 'premiere pro'),
  h('UX Design', 'ux', 'ux design', 'user experience'),
  h('UI Design', 'ui design', 'user interface design', 'visual design'),
  h('Interaction Design', 'interaction design'),
  h('Wireframing', 'wireframing', 'wireframes'),
  h('Prototyping', 'prototyping', 'prototypes'),
  h('Usability Testing', 'usability testing'),
  h('Design Systems', 'design system', 'design systems', 'component library'),
  h('Information Architecture', 'information architecture'),

  // ── Marketing ──────────────────────────────────────────────────────────
  h('Search Engine Optimization (SEO)', 'seo', 'search engine optimization', 'search engine optimisation'),
  h('Search Engine Marketing (SEM)', 'sem', 'search engine marketing', 'paid search', 'ppc', 'pay-per-click'),
  h('Google Ads', 'google ads', 'adwords'),
  h('Meta Ads', 'facebook ads', 'meta ads', 'instagram ads'),
  h('Content Marketing', 'content marketing', 'content strategy'),
  h('Copywriting', 'copywriting', 'copy writing'),
  h('Email Marketing', 'email marketing', 'email campaigns', 'lifecycle marketing', 'crm marketing'),
  h('Marketing Automation', 'marketing automation', 'hubspot', 'marketo', 'pardot', 'mailchimp', 'klaviyo'),
  h('Social Media Marketing', 'social media marketing', 'social media', 'community management'),
  h('Performance Marketing', 'performance marketing', 'paid media', 'paid social', 'growth marketing'),
  h('Conversion Rate Optimization', 'cro', 'conversion rate optimization', 'conversion optimisation'),
  h('Brand Management', 'brand management', 'branding', 'brand strategy'),
  h('Market Research', 'market research', 'competitive analysis', 'competitor analysis'),
  h('Demand Generation', 'demand generation', 'demand gen', 'lead generation'),
  h('Product Marketing', 'product marketing', 'product positioning'),
  h('Public Relations', 'public relations', 'media relations'),
  h('Campaign Management', 'campaign management'),
  h('Marketing Analytics', 'marketing analytics', 'attribution', 'roas', 'cac', 'ltv'),

  // ── Sales / customer ───────────────────────────────────────────────────
  h('Salesforce', 'salesforce', 'sfdc'),
  h('CRM', 'crm', 'customer relationship management'),
  h('B2B Sales', 'b2b', 'b2b sales'),
  h('SaaS', 'saas', 'software as a service'),
  h('Account Management', 'account management', 'key account management'),
  h('Business Development', 'business development', 'bizdev'),
  h('Pipeline Management', 'pipeline management', 'sales pipeline', 'pipeline generation'),
  h('Prospecting', 'prospecting', 'cold calling', 'outbound'),
  h('Negotiation', 'negotiation', 'negotiating'),
  h('Sales Forecasting', 'sales forecasting'),
  h('Quota Attainment', 'quota', 'quota attainment', 'exceeded quota'),
  h('Customer Success', 'customer success', 'client success'),
  h('Customer Retention', 'retention', 'churn reduction', 'customer retention', 'renewals'),
  h('Onboarding', 'onboarding', 'customer onboarding', 'client onboarding'),
  h('Zendesk', 'zendesk', 'freshdesk', 'intercom'),
  h('Customer Service', 'customer service', 'customer support', 'client service'),

  // ── Finance / accounting ───────────────────────────────────────────────
  h('Financial Modeling', 'financial modeling', 'financial modelling', 'financial models'),
  h('Financial Analysis', 'financial analysis'),
  h('FP&A', 'fp&a', 'financial planning and analysis', 'financial planning & analysis'),
  h('Budgeting and Forecasting', 'budgeting and forecasting', 'variance analysis'),
  h('Valuation', 'valuation', 'dcf', 'discounted cash flow'),
  h('GAAP', 'gaap', 'us gaap'),
  h('IFRS', 'ifrs', 'ind as'),
  h('Accounts Payable', 'accounts payable'),
  h('Accounts Receivable', 'accounts receivable'),
  h('General Ledger', 'general ledger', 'month-end close', 'month end close', 'reconciliation', 'reconciliations'),
  h('Auditing', 'audit', 'auditing', 'internal audit', 'external audit'),
  h('Taxation', 'tax', 'taxation', 'gst', 'tds', 'income tax'),
  h('SAP', 'sap', 'sap fico', 'sap s/4hana'),
  h('Oracle ERP', 'oracle financials', 'oracle erp', 'netsuite'),
  h('QuickBooks', 'quickbooks', 'xero', 'tally'),
  h('ERP', 'erp'),
  h('Compliance', 'compliance', 'regulatory compliance'),
  h('SOX', 'sox', 'sarbanes-oxley'),
  h('Anti-Money Laundering', 'aml', 'anti-money laundering', 'kyc'),

  // ── HR / people ────────────────────────────────────────────────────────
  h('Recruiting', 'recruiting', 'recruitment', 'talent acquisition', 'sourcing'),
  h('Applicant Tracking Systems', 'ats', 'applicant tracking system', 'workday', 'greenhouse', 'lever', 'icims', 'taleo', 'successfactors'),
  h('Employee Relations', 'employee relations'),
  h('Performance Management', 'performance management', 'performance reviews'),
  h('Compensation and Benefits', 'compensation', 'benefits administration', 'total rewards', 'payroll'),
  h('HRIS', 'hris', 'bamboohr', 'hr information systems'),
  h('Learning and Development', 'learning and development', 'l&d', 'training and development'),
  h('Employment Law', 'employment law', 'labor law', 'labour law'),
  h('Diversity and Inclusion', 'diversity and inclusion', 'dei', 'd&i'),
  h('Workforce Planning', 'workforce planning', 'headcount planning'),

  // ── Operations / supply chain ──────────────────────────────────────────
  h('Supply Chain Management', 'supply chain', 'supply chain management'),
  h('Logistics', 'logistics', 'distribution management'),
  h('Inventory Management', 'inventory management', 'inventory control', 'stock control'),
  h('Demand Planning', 'demand planning', 's&op'),
  h('Operations Management', 'operations management'),
  h('Quality Assurance', 'quality assurance', 'qa', 'quality control', 'qc'),
  h('Manual Testing', 'manual testing', 'test cases', 'regression testing'),
  h('Test Automation', 'test automation', 'automated testing', 'automation testing'),

  // ── Healthcare / education / other domains ─────────────────────────────
  h('Patient Care', 'patient care', 'patient safety'),
  h('Electronic Health Records', 'ehr', 'emr', 'electronic health records', 'epic systems', 'cerner'),
  h('HIPAA', 'hipaa'),
  h('Clinical Documentation', 'clinical documentation', 'charting'),
  h('Medication Administration', 'medication administration'),
  h('Curriculum Development', 'curriculum development', 'curriculum design', 'lesson planning'),
  h('Classroom Management', 'classroom management'),
  h('Technical Writing', 'technical writing', 'documentation'),
  h('Content Writing', 'content writing', 'editing', 'proofreading'),
  h('AutoCAD', 'autocad'),
  h('SolidWorks', 'solidworks'),
  h('Project Scheduling', 'ms project', 'microsoft project', 'primavera', 'project scheduling'),
  h('Microsoft Office', 'microsoft office', 'ms office', 'office 365', 'microsoft 365', 'powerpoint', 'microsoft word', 'ms word'),
  h('Google Workspace', 'google workspace', 'g suite', 'google sheets', 'google docs'),

  // ── Certifications ─────────────────────────────────────────────────────
  c('PMP', 'pmp', 'project management professional'),
  c('PRINCE2', 'prince2'),
  c('Certified ScrumMaster (CSM)', 'csm', 'certified scrummaster', 'certified scrum master', 'psm'),
  c('AWS Certified', 'aws certified', 'aws solutions architect', 'aws certified solutions architect'),
  c('Azure Certification', 'az-900', 'az-104', 'azure certified', 'azure administrator'),
  c('Google Cloud Certification', 'gcp certified', 'google cloud certified', 'professional cloud architect'),
  c('CKA', 'cka', 'certified kubernetes administrator'),
  c('CISSP', 'cissp'),
  c('CompTIA Security+', 'security+', 'comptia security+'),
  c('CEH', 'ceh', 'certified ethical hacker'),
  c('CPA', 'cpa', 'certified public accountant'),
  c('CA', 'chartered accountant', 'aca', 'icai'),
  c('CFA', 'cfa', 'chartered financial analyst'),
  c('ACCA', 'acca'),
  c('CMA', 'cma', 'certified management accountant'),
  c('SHRM-CP', 'shrm', 'shrm-cp', 'shrm-scp'),
  c('CIPD', 'cipd'),
  c('Six Sigma Green Belt', 'green belt', 'black belt', 'six sigma certification'),
  c('Google Ads Certification', 'google ads certified', 'google ads certification'),
  c('HubSpot Certification', 'hubspot certified', 'hubspot certification'),
  c('Registered Nurse (RN)', 'registered nurse'),
  c('BLS', 'bls', 'basic life support', 'cpr', 'acls'),
  c('ITIL', 'itil'),
  c('CCNA', 'ccna'),

  // ── Soft skills ────────────────────────────────────────────────────────
  s('Communication', 'communication', 'communication skills', 'written communication', 'verbal communication'),
  s('Leadership', 'leadership', 'people management', 'team leadership'),
  s('Cross-Functional Collaboration', 'cross-functional', 'cross functional', 'collaboration', 'cross-functional teams'),
  s('Problem Solving', 'problem solving', 'problem-solving', 'troubleshooting'),
  s('Critical Thinking', 'critical thinking', 'analytical thinking', 'analytical skills'),
  s('Attention to Detail', 'attention to detail', 'detail-oriented', 'detail oriented'),
  s('Time Management', 'time management', 'prioritization', 'prioritisation'),
  s('Mentoring', 'mentoring', 'coaching'),
  s('Presentation Skills', 'presentation skills', 'presenting', 'public speaking'),
  s('Customer Focus', 'customer focus', 'customer-centric', 'customer obsession'),
  s('Ownership', 'ownership', 'accountability'),
  s('Adaptability', 'adaptability', 'flexibility'),
];

/** Words that appear constantly in job ads but are not searchable skills. */
export const JD_NOISE = new Set(
  `a about above across after again against all also an and any are around as at be because been before being below between both but by can could did do does doing down during each else etc ever every few for from further had has have having he her here hers him his how i if in into is it its itself just me more most my no nor not now of off on once only or other our ours out over own per same she should so some such than that the their theirs them then there these they this those through to too under until up upon us very via was we were what when where which while who whom why will with within without would you your yours yourself
  ability able abilities accountable achieve across additional advantage apply applicant applicants applications appropriate area areas assist assigned background based basic benefits best bonus build building candidate candidates career careers closely company competitive complex comprehensive contribute core culture current customers daily day dedicated degree demonstrated deliver delivering department description desired develop developing development diverse duties dynamic effective effectively employee employees employer employment ensure environment equal equivalent essential excellent exceptional excited existing expected experience experienced expert expertise familiar familiarity fast field focus focused following full fun functions global good grow growing growth help high highly hire hiring ideal impact important include includes including individual industry innovative internal job join key knowledge large lead leading learn level life like looking make manage managing many may meet member members minimum mission must need needed new nice offer office one opportunity opportunities opportunity organization organisation others part passion passionate people perform plus position positive preferred previous primary proactive proven provide providing qualifications qualified quality range related relevant remote report reporting require required requirement requirements responsibilities responsibility responsible role roles salary self seeking senior skill skills solid solutions someone start strong success successful support supporting take team teams things think time today tools track type understanding unique use used using value values variety want way well within work working world year years`.split(/\s+/),
);

/** Action verbs that open strong resume bullets. */
export const ACTION_VERBS = new Set(
  `accelerated achieved administered advised analysed analyzed architected automated boosted built championed coached collaborated completed consolidated coordinated created cut decreased defined delivered deployed designed developed directed doubled drove eliminated enabled engineered established exceeded executed expanded facilitated founded generated grew guided halved headed identified implemented improved increased initiated integrated introduced launched led managed mentored migrated modernized negotiated optimized orchestrated organized overhauled owned partnered pioneered planned produced programmed raised rebuilt redesigned reduced refactored resolved restructured revamped saved scaled secured shipped simplified spearheaded standardized streamlined strengthened supervised trained transformed tripled upgraded won wrote`.split(/\s+/),
);

/** Weak openers recruiters skim past. */
export const WEAK_OPENERS = [
  'responsible for', 'duties included', 'worked on', 'helped with', 'assisted with', 'tasked with', 'involved in', 'in charge of',
];
