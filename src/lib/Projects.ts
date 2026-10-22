import gpuStudy from '../data/project-studies/ai-infra-gpu-study.json';

export interface ProjectStudy {
	slug: string;
	title: string;
	description: string;
	technologies: string[];
	sourcePath: string;
	report?: { entry: string; assets: string[] };
}

export interface Project {
	title: string;
	technologies: string[];
	description: string;
	url: string;
	// Last verified repository or linked project-page commit date, in UTC (YYYY-MM-DD).
	updatedAt?: string;
	status?: 'preparing';
	slug?: string;
	sourceRef?: string;
	studies?: ProjectStudy[];
}

const projects: Project[] = [
	{
		title: 'AI Infrastructure & GPU Study',
		slug: gpuStudy.slug,
		sourceRef: gpuStudy.ref,
		studies: gpuStudy.studies,
		technologies: ['CUDA', 'PyTorch', 'vLLM', 'GPU Profiling'],
		description:
			'Hands-on experiments exploring CUDA streams, PyTorch and vLLM inference, and numerical errors in CUDA graphs. Includes reproducible examples and profiling notes from NVIDIA GPU hardware.',
		url: `https://github.com/${gpuStudy.repository}`,
		updatedAt: '2026-10-20'
	},
	{
		title: 'SystemSketch',
		technologies: [],
		description: '',
		url: '',
		status: 'preparing'
	},
	{
		title: 'Fun TUI in Rust',
		technologies: ['Rust', 'TUI', 'CLI', 'Crossterm'],
		description:
			'A fun terminal user interface (TUI) application built using Rust and the Crossterm library. This project showcases my skills in Rust programming and TUI development, providing an engaging and interactive experience for users in the terminal environment.',
		url: 'https://gitea.com/lialittis/fun-tui',
		updatedAt: '2025-12-29'
	},
	{
		title: 'Cryptology Labs',
		technologies: ['Cryptology', '', '', ''],
		description:
			'Implementations of Different Cryptology Approaches',
		url: 'https://github.com/lialittis/Cryptology-Practice',
		updatedAt: '2022-02-08'
	},
	{
		title: 'IOT Project of Medicine-Guardian',
		technologies: ['Wireless', 'IoT', '', ''],
		description:
			'FIT/IOT Lab Wireless - Abundant IoT applications are implemented in various kinds of scenarios, here in this project, I propose one IoT application working on the safety of sensitive cargo during transportation.',
		url: 'https://lialittis.github.io/projects/fit_iot_lab_wireless/',
		updatedAt: '2023-09-05'
	},
	{
		title: 'Smart Contract Optimization',
		technologies: ['S-meraheuristics Search', 'Translation Validation', 'OCaml', 'Z3'],
		description:
			'Optimal Synthesis of Michelson Bytecode - The objective of this project is to optimize Michelson Bytecode with respect to gas consumed. Specifically, we study super-optimization(finding global program optimizations which might be missed by a smaller and simpler search for local optimizations). We aim for an heuristics-based method using S-metaheuristics to find the optimal bytecode in a fully blackbox way.',
		url: 'https://lialittis.github.io/projects/smart_contract_project/',
		updatedAt: '2023-08-26'
	},
	{
		title: 'Data Visualisation',
		technologies: ['NodeJs', 'D3', 'JS', 'Data Analysis'],
		description:
			'Exploring the transportation of Switzerland',
		url: 'https://lialittis.github.io/projects/data_visualisation/',
		updatedAt: '2023-09-05'
	},
	{
		title: 'ODE Dynamical System',
		technologies: ['Simulation', 'Autonomous System'],
		description: 'Lane changing operations of autonomous vehicles(with Simulink Simulation)',
		url: 'https://lialittis.github.io/projects/lane_changing_project/',
		updatedAt: '2023-09-05'
	}
];

export default projects;

export function getStudySourceUrl(project: Project, study: ProjectStudy, sourceRef = project.sourceRef ?? 'main'): string {
	const ref = encodeURIComponent(sourceRef);
	const source = study.sourcePath.split('/').map(encodeURIComponent).join('/');
	return `${project.url}/tree/${ref}/${source}`;
}
