// src/lib/rolesData.ts
// Taxonomy for all supported roles.
// Provides deterministic categorization and core keywords for the Insights and Role Guides features.

export interface RoleData {
  slug: string;
  title: string;
  category: string;
  description: string;
  coreKeywords: string[];
}

const ROLES: RoleData[] = [
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    category: 'Engineering',
    description: 'Design, develop, and maintain software systems and applications.',
    coreKeywords: ['System Architecture', 'Algorithms', 'Data Structures', 'Git', 'Agile', 'CI/CD', 'Testing'],
  },
  {
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    category: 'Engineering',
    description: 'Build user interfaces and client-side web applications.',
    coreKeywords: ['JavaScript', 'TypeScript', 'React', 'Vue', 'CSS', 'HTML', 'Responsive Design', 'Web Performance', 'Accessibility'],
  },
  {
    slug: 'backend-engineer',
    title: 'Backend Engineer',
    category: 'Engineering',
    description: 'Develop server-side logic, APIs, and database architectures.',
    coreKeywords: ['Node.js', 'Python', 'Java', 'Go', 'REST APIs', 'GraphQL', 'PostgreSQL', 'Microservices', 'Docker'],
  },
  {
    slug: 'full-stack-engineer',
    title: 'Full Stack Engineer',
    category: 'Engineering',
    description: 'Handle both client-side and server-side software development.',
    coreKeywords: ['React', 'Node.js', 'TypeScript', 'SQL', 'NoSQL', 'AWS', 'System Design', 'REST', 'Git'],
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'Engineering',
    description: 'Bridge development and operations to automate and streamline deployments.',
    coreKeywords: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Bash', 'Jenkins', 'Monitoring'],
  },
  {
    slug: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data',
    description: 'Analyze complex datasets to extract actionable business insights.',
    coreKeywords: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistical Analysis', 'Pandas', 'TensorFlow', 'Data Visualization'],
  },
  {
    slug: 'data-engineer',
    title: 'Data Engineer',
    category: 'Data',
    description: 'Build and maintain scalable data pipelines and architectures.',
    coreKeywords: ['Python', 'SQL', 'Spark', 'Hadoop', 'ETL', 'AWS', 'Snowflake', 'Airflow', 'Kafka'],
  },
  {
    slug: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    category: 'Data',
    description: 'Design and deploy scalable machine learning models into production.',
    coreKeywords: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'MLOps', 'Model Deployment', 'AWS'],
  },
  {
    slug: 'product-manager',
    title: 'Product Manager',
    category: 'Product',
    description: 'Lead the strategy, development, and launch of digital products.',
    coreKeywords: ['Product Strategy', 'Agile', 'Scrum', 'User Research', 'Data Analysis', 'Roadmapping', 'A/B Testing', 'Stakeholder Management'],
  },
  {
    slug: 'project-manager',
    title: 'Project Manager',
    category: 'Product',
    description: 'Coordinate cross-functional teams to deliver projects on time and within scope.',
    coreKeywords: ['Agile', 'Scrum', 'Jira', 'Risk Management', 'Resource Allocation', 'Budgeting', 'Stakeholder Communication'],
  },
  {
    slug: 'ux-designer',
    title: 'UX Designer',
    category: 'Design',
    description: 'Optimize the usability and user journey of digital products.',
    coreKeywords: ['Wireframing', 'Prototyping', 'User Research', 'Usability Testing', 'Figma', 'Information Architecture', 'User Personas'],
  },
  {
    slug: 'ui-designer',
    title: 'UI Designer',
    category: 'Design',
    description: 'Design the visual layout, typography, and interactive elements of interfaces.',
    coreKeywords: ['Figma', 'Sketch', 'Typography', 'Color Theory', 'Design Systems', 'Responsive Design', 'Adobe Creative Suite'],
  },
  {
    slug: 'product-designer',
    title: 'Product Designer',
    category: 'Design',
    description: 'Oversee the entire design process, combining UX and UI to solve user problems.',
    coreKeywords: ['End-to-End Design', 'Figma', 'Prototyping', 'Design Thinking', 'User Testing', 'Interaction Design', 'Wireframing'],
  },
  {
    slug: 'qa-engineer',
    title: 'QA Engineer',
    category: 'Engineering',
    description: 'Ensure software quality through automated and manual testing methodologies.',
    coreKeywords: ['Test Automation', 'Selenium', 'Cypress', 'Jest', 'Manual Testing', 'Bug Tracking', 'CI/CD', 'API Testing'],
  },
  {
    slug: 'business-analyst',
    title: 'Business Analyst',
    category: 'Business',
    description: 'Analyze business processes and bridge the gap between IT and the business.',
    coreKeywords: ['Requirements Gathering', 'Process Modeling', 'SQL', 'Tableau', 'Data Analysis', 'Agile', 'Stakeholder Management'],
  },
  {
    slug: 'marketing-manager',
    title: 'Marketing Manager',
    category: 'Marketing',
    description: 'Develop and execute marketing strategies to drive brand awareness and acquisition.',
    coreKeywords: ['Digital Marketing', 'SEO', 'SEM', 'Content Strategy', 'Google Analytics', 'Email Marketing', 'Campaign Management'],
  },
  {
    slug: 'sales-executive',
    title: 'Sales Executive',
    category: 'Business',
    description: 'Drive revenue growth by acquiring and maintaining client relationships.',
    coreKeywords: ['B2B Sales', 'CRM', 'Salesforce', 'Lead Generation', 'Negotiation', 'Account Management', 'Cold Calling'],
  },
  {
    slug: 'human-resources-manager',
    title: 'Human Resources Manager',
    category: 'Operations',
    description: 'Oversee recruitment, employee relations, and organizational development.',
    coreKeywords: ['Talent Acquisition', 'Employee Relations', 'Performance Management', 'Onboarding', 'HRIS', 'Compliance', 'Benefits Administration'],
  }
];

/**
 * Returns the complete list of all supported roles.
 */
export function getAllRoles(): RoleData[] {
  return ROLES;
}

/**
 * Finds a specific role by its URL-friendly slug.
 * 
 * @param slug The role identifier (e.g., 'frontend-engineer')
 * @returns The RoleData object or undefined if not found
 */
export function getRoleBySlug(slug: string): RoleData | undefined {
  return ROLES.find(role => role.slug === slug);
}