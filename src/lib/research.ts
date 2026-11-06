/** Publication metadata checked against the publisher; abstracts retained from the site. */
export const publications = [
  {
    slug: 'security-for-distributed-machine-learning',
    title: 'Security for Distributed Machine Learning',
    authors: ['Laurent Gomez', 'Tianchi Yu', 'Patrick Duverger'],
    venue: 'SECRYPT',
    conference: '20th International Conference on Security and Cryptography',
    year: 2023,
    abstract: "With the adoption of IoT-like technologies, industrials aim to enhance the business value of their physical assets and improve their operational efficiency. However, IoT devices alone tend to strain enterprise systems with a sheer volume of unstructured and unfiltered data. To overcome this challenge, endowing (smart) devices with AI-based capabilities can significantly enhance enterprise system capabilities. However, deploying AI-based capabilities on potentially insecure edge hardware and platforms introduces new security risks, including AI model theft, poisoning, and data leaks. This paradigm shift necessitates the protection of distributed AI applications and data. In this paper, we propose a solution for safeguarding the Intellectual Property and data privacy of ML-based software. We utilize hardware-assisted Privacy Enhancing Technologies, specifically Trusted Execution Environments. We evaluate the effectiveness of our approach in the context of ML-based motion detection in CCTV cameras. This work is part of a co-innovation project with the Smart City of Antibes, France.",
    url: 'https://doi.org/10.5220/0012137700003555',
    pdf: 'https://www.scitepress.org/Papers/2023/121377/121377.pdf'
  }
]

/** Broad directions already described on the website, without unpublished project claims. */
export const researchDirections = [
  {
    title: 'System and hardware security',
    description: 'Memory protection and trustworthy systems.'
  },
  {
    title: 'Hardware–software co-design',
    description: 'Security at the boundary between system software and hardware.'
  },
  {
    title: 'AI infrastructure and heterogeneous computing',
    description: 'GPU execution, inference runtimes, and numerical correctness.',
    href: '/project/ai-infra-gpu-study/'
  }
]
