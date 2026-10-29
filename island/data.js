// Content for the research-island homepage.
// Each island is one research theme; `q`/`r` are axial hex coordinates.
// Edit this file to update the homepage — no build step needed.

export const GROUP = {
  name: "Kao Group",
  zh: "高英哲研究群",
  tagline: "Computational Quantum Matter",
  affiliation: "Department of Physics, National Taiwan University",
};

export const ISLANDS = [
  {
    id: "hub",
    q: 0, r: 0,
    kind: "hub",
    title: "Kao Group",
    zh: "研究群",
    color: "#DB6A41",
    blurb:
      "We combine computational methods with analytical tools to study novel phenomena in quantum many-body systems — advancing tensor networks and machine learning, and applying them to hard problems in condensed matter and high-energy physics.",
    links: [
      { label: "People", href: "/members/" },
      { label: "All publications", href: "/publications/" },
      { label: "Ying-Jer Kao", href: "/yingjerkao/" },
      { label: "Join us", href: "/perspective/" },
      { label: "Contact", href: "/contact/" },
    ],
    papers: [],
  },
  {
    id: "tn",
    q: 1, r: -1,
    kind: "tensor",
    title: "Tensor Networks",
    zh: "張量網路",
    color: "#3E7CB1",
    blurb:
      "Entanglement grows exponentially with system size; tensor networks compress it. We develop new tensor-network algorithms — from finite-size scaling of classical models to fractal lattices — and turn them into tools others can use.",
    papers: [
      { t: "Tensor network based finite-size scaling for two-dimensional classical models", v: "Phys. Rev. B 107, 205123 (2023)", u: "https://journals.aps.org/prb/abstract/10.1103/PhysRevB.107.205123" },
      { t: "Variational tensor network operator", v: "Phys. Rev. Research 4, 043153 (2022)", u: "https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.4.043153" },
      { t: "J1-J2 fractal studied by multi-recursion tensor-network method", v: "Phys. Rev. E 105, 024124 (2022)", u: "https://journals.aps.org/pre/abstract/10.1103/PhysRevE.105.024124" },
      { t: "Detecting transition between Abelian and non-Abelian topological orders through symmetric tensor networks", v: "Phys. Rev. B 104, 045131 (2021)", u: "https://doi.org/10.1103/PhysRevB.104.045131" },
    ],
  },
  {
    id: "code",
    q: 1, r: 0,
    kind: "software",
    title: "Open Software",
    zh: "開源軟體",
    color: "#5A9367",
    blurb:
      "Cytnx and Tenax put state-of-the-art tensor-network algorithms in everyone's hands. Tenax is a differentiable, symmetry-aware JAX library for CPU, GPU, TPU and Apple Silicon, with an MCP server and a Claude Code toolkit for AI-assisted physics workflows.",
    links: [
      { label: "Tenax", href: "https://tenax-lab.github.io" },
      { label: "Cytnx", href: "https://github.com/Cytnx-dev/Cytnx" },
    ],
    papers: [
      { t: "The Cytnx library for tensor networks", v: "SciPost Phys. Codebases 53 (2025)", u: "https://scipost.org/10.21468/SciPostPhysCodeb.53" },
      { t: "Tenax: a JAX-based tensor network library", v: "tenax-lab.github.io", u: "https://tenax-lab.github.io" },
    ],
  },
  {
    id: "lgt",
    q: 0, r: 1,
    kind: "gauge",
    title: "Lattice Gauge Theories",
    zh: "晶格規範場論",
    color: "#8E5BA8",
    blurb:
      "The only first-principles route into strongly coupled quantum field theory. We map phase diagrams, real-time dynamics and confinement with Monte Carlo and tensor networks — including multi-Higgs models beyond the Standard Model.",
    papers: [
      { t: "Lattice investigation of custodial two-Higgs-doublet model at weak quartic couplings", v: "JHEP 2025, 214 (2025)", u: "https://doi.org/10.1007/JHEP10(2025)214" },
      { t: "Dynamical quantum phase transition and thermal equilibrium in the lattice Thirring model", v: "Phys. Rev. Research 7, 023194 (2025)", u: "https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.7.023194" },
      { t: "Lattice study of SU(2) gauge theory coupled to four adjoint Higgs fields", v: "Phys. Rev. Research 6, 043172 (2024)", u: "https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.6.043172" },
      { t: "Phase structure of the CP(1) model in the presence of a topological θ-term", v: "Phys. Rev. D 105, 054507 (2022)", u: "https://journals.aps.org/prd/abstract/10.1103/PhysRevD.105.054507" },
    ],
  },
  {
    id: "qsim",
    q: -1, r: 1,
    kind: "quantum",
    title: "Quantum Simulation",
    zh: "量子模擬",
    color: "#2F9C9C",
    blurb:
      "Running field theories on today's noisy quantum processors. We push real-time simulation of confinement and meson spectroscopy on digital quantum devices, benchmarked against tensor-network results.",
    papers: [
      { t: "Improved Ising meson spectroscopy simulation on a noisy digital quantum device", v: "arXiv:2512.02516", u: "https://arxiv.org/abs/2512.02516" },
      { t: "Variational quantum reinforcement learning via evolutionary optimization", v: "Mach. Learn.: Sci. Technol. 3, 015025 (2022)", u: "https://iopscience.iop.org/article/10.1088/2632-2153/ac4559" },
    ],
  },
  {
    id: "ml",
    q: -1, r: 0,
    kind: "neural",
    title: "Machine Learning",
    zh: "機器學習",
    color: "#D19A2E",
    blurb:
      "Two directions: machine learning for physics — neural networks that find phases or perform the renormalization group — and physics for machine learning, using tensor networks to build models that are more powerful and interpretable. We also benchmark how well AI does expert-level theory.",
    papers: [
      { t: "CMT-Benchmark: a benchmark for condensed matter theory built by expert researchers", v: "ICLR 2026", u: "https://arxiv.org/abs/2510.05228" },
      { t: "Learning phases with quantum Monte Carlo simulation cell", v: "Mach. Learn.: Sci. Technol. 6, 045017 (2025)", u: "https://iopscience.iop.org/article/10.1088/2632-2153/ae107c/meta" },
      { t: "Neural Monte Carlo renormalization group", v: "Phys. Rev. Research 3, 023230 (2021)", u: "https://doi.org/10.1103/PhysRevResearch.3.023230" },
      { t: "An end-to-end trainable hybrid classical-quantum classifier", v: "Mach. Learn.: Sci. Technol. 2, 045021 (2021)", u: "https://iopscience.iop.org/article/10.1088/2632-2153/ac104d" },
    ],
  },
  {
    id: "topo",
    q: 0, r: -1,
    kind: "kagome",
    title: "Topological & Correlated Matter",
    zh: "拓撲與強關聯",
    color: "#C4566B",
    blurb:
      "Phases governed by entanglement and frustration: topological insulators, quantum spin liquids, kagome ice. We use numerics to discover and characterize them, often alongside experiments.",
    papers: [
      { t: "Direct visualization of a disorder-driven electronic smectic phase in GdSbTe", v: "npj Quantum Mater. 10, 56 (2025)", u: "https://www.nature.com/articles/s41535-025-00779-y" },
      { t: "Chern dartboard insulator: sub-Brillouin zone topology and skyrmion multipoles", v: "Commun. Phys. 7, 32 (2024)", u: "https://doi.org/10.1038/s42005-023-01502-8" },
      { t: "Excitation spectrum of spin-1 Kitaev spin liquids", v: "Phys. Rev. B 105, L060403 (2022)", u: "https://doi.org/10.1103/PhysRevB.105.L060403" },
      { t: "Emergent snake magnetic domains in canted kagome ice", v: "Phys. Rev. Research 2, 023046 (2020)", u: "https://doi.org/10.1103/PhysRevResearch.2.023046" },
      { t: "Entanglement Rényi negativity across a finite temperature transition", v: "Phys. Rev. Lett. 125, 140603 (2020)", u: "https://doi.org/10.1103/PhysRevLett.125.140603" },
    ],
  },
];

// Bridges between islands: work that sits on both shores.
export const BRIDGES = [
  { a: "tn", b: "code", label: "Algorithms → libraries", via: "Cytnx, Tenax" },
  { a: "tn", b: "lgt", label: "Tensor networks for field theory", via: "Lattice Thirring model" },
  { a: "tn", b: "topo", label: "Symmetric tensor networks for topological order", via: "Abelian ↔ non-Abelian transition" },
  { a: "tn", b: "ml", label: "Tensor-network classifiers", via: "Hybrid TN + variational circuit" },
  { a: "lgt", b: "qsim", label: "Gauge theories on quantum hardware", via: "Ising meson spectroscopy" },
  { a: "ml", b: "qsim", label: "Quantum machine learning", via: "Variational quantum RL" },
  { a: "code", b: "ml", label: "AI-assisted physics", via: "Tenax MCP server, CMT-Benchmark" },
];
