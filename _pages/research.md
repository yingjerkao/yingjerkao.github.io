---
layout: splash
permalink: /research/
title: "Our Research"
header:
  overlay_image: "/assets/images/daniele-levis-pelusi-383478-unsplash.jpg"
  caption: "Photo by Daniele Levis Pelusi on Unsplash"

---

# Our Research

Our main research focus is using computational methods combined with analytical tools to study novel phenomena in many-body systems. In the past five years, we have focused on advancing numerical methods, particularly tensor networks and machine learning, and applying them to challenging problems in condensed matter and high-energy physics.

---

## Recent Highlights

**CMT-Benchmark: A Benchmark for Condensed Matter Theory Built by Expert Researchers**
*H. Pan, J. V. Roggeveen, E. Berg, J. Carrasquilla, Y.-J. Kao, et al.*
[ICLR 2026](https://arxiv.org/abs/2510.05228) — We introduce CMT-Benchmark, a rigorous benchmark for evaluating AI models on expert-level condensed matter theory tasks, built collaboratively by domain researchers. Accepted at the International Conference on Learning Representations 2026.

**Improved Ising Meson Spectroscopy Simulation on a Noisy Digital Quantum Device**
*H.-T. Hung, I. N. M. Le, J. Knolle, Y.-J. Kao*
[arXiv:2512.02516](https://arxiv.org/abs/2512.02516) — We demonstrate improved real-time quantum simulation of meson spectroscopy in the Ising field theory on a noisy quantum processor, advancing the frontier of near-term quantum simulation for lattice field theories.

**The Cytnx Library for Tensor Networks**
*K.-H. Wu, C.-T. Lin, K. Hsu, H.-T. Hung, M. Schneider, C.-M. Chung, Y.-J. Kao, P. Chen*
[SciPost Phys. Codebases 53 (2025)](https://scipost.org/10.21468/SciPostPhysCodeb.53) — We present Cytnx, an open-source tensor network library with a Python/C++ interface that supports both CPU and GPU backends, designed to make state-of-the-art tensor network algorithms accessible to the broader physics community.

**Dynamical Quantum Phase Transition and Thermal Equilibrium in the Lattice Thirring Model**
*M. C. Bañuls, K. Cichy, H.-T. Hung, Y.-J. Kao, C.-J. D. Lin, A. Singh*
[Phys. Rev. Research 7, 023194 (2025)](https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.7.023194) — Using tensor network methods, we investigate dynamical quantum phase transitions and thermalization in the massive Thirring model, a paradigmatic 1+1D lattice field theory.

**Direct Visualization of a Disorder-Driven Electronic Smectic Phase in GdSbTe**
*B. Venkatesan, S.-Y. Guan, Y.-J. Kao, T.-M. Chuang, et al.*
[npj Quantum Mater. 10, 56 (2025)](https://www.nature.com/articles/s41535-025-00779-y) — In collaboration with experiment, we provide theoretical insight into the disorder-driven electronic liquid-crystal (smectic) phase observed by STM in the non-symmorphic semimetal GdSbTe.

---

## Tensor Networks and Numerical Methods

Accurately simulating quantum many-body systems is a central challenge in physics, largely due to the exponential growth of information (entanglement) with system size. **Tensor Networks (TN) are a powerful class of numerical methods** designed to efficiently represent and manipulate these complex quantum states. Our group focuses on both developing new tensor-network algorithms to push the boundaries of what can be simulated, and on creating accessible, high-performance software libraries (like Cytnx) to make these tools available to the wider community. This research enables us to tackle problems previously out of reach, from studying classical statistical models in new ways to probing the complex geometries of fractals.

* **The Cytnx Library for Tensor Networks**,
    Kai-Hsin Wu, Chang-Teng Lin, Ke Hsu, Hao-Ti Hung, Manuel Schneider, Chia-Min Chung, Ying-Jer Kao, Pochung Chen, [SciPost Phys. Codebases 53 (2025)](https://scipost.org/10.21468/SciPostPhysCodeb.53).
* **Tenax: A JAX-Based Tensor Network Library**,
    [tenax-lab.github.io](https://tenax-lab.github.io) — A fully differentiable, symmetry-aware tensor network library built on JAX, supporting block-sparse U(1), Zn, and fermionic symmetries with GPU/TPU/Apple Silicon acceleration. Implements DMRG, iDMRG, TRG/HOTRG, iPEPS, and more. Tenax features deep AI integration via an **MCP server** that exposes tensor network calculations (DMRG, TRG, Hamiltonian construction, contraction optimization, and more) directly to Claude Code, enabling AI-assisted quantum physics workflows without manual setup. It also ships the **Tenax Toolkit**, a Claude Code plugin with 18 domain-specific skills covering algorithm workflows (DMRG, iPEPS, TRG, fermionic iPEPS), symmetry handling, AutoMPO, and migration guides from other libraries such as ITensor, TeNPy, Cytnx, and quimb.
* **Tensor Network Based Finite-Size Scaling for Two-Dimensional Classical Models**,
    Ching-Yu Huang, Sing-Hong Chan, Ying-Jer Kao, Pochung Chen, [Phys. Rev. B, 107 205123 (2023)](https://journals.aps.org/prb/abstract/10.1103/PhysRevB.107.205123).
* **Variational Tensor Network Operator**,
    Yu-Hsueh Chen, Ke Hsu, Wei-Lin Tu, Hyun-Yong Lee, Ying-Jer Kao, [Phys. Rev. Research 4, 043153(2022)](https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.4.043153).
* **J1-J2 fractal studied by multi-recursion tensor-network method**,
    Josef Genzor, Andrej Gendiar, Ying-Jer Kao, [Phys. Rev. E 105, 024124(2022)](https://journals.aps.org/pre/abstract/10.1103/PhysRevE.105.024124).
* **Detecting transition between Abelian and non-Abelian topological orders through symmetric tensor networks**,
    Yu-Hsueh Chen, Ching-Yu Huang, and Ying-Jer Kao, [Phys. Rev. B 104, 045131(2021)](https://doi.org/10.1103/PhysRevB.104.045131).

---

## Lattice Gauge Theories

**Lattice Gauge Theories are a cornerstone of modern theoretical physics**, providing the only known way to study the non-perturbative (strong-coupling) regime of quantum field theories from first principles. These theories are fundamental to the Standard Model of particle physics, describing the interactions of quarks and gluons. Our research uses large-scale numerical simulations and tensor network methods to investigate the rich behavior of these theories. We map out their phase diagrams, study their dynamics, and explore fundamental questions about confinement, symmetry breaking, and the nature of matter under extreme conditions, including models relevant to physics beyond the Standard Model (like those with multiple Higgs fields).

* **Lattice investigation of custodial two-Higgs-doublet model at weak quartic couplings**,
    Guilherme Catumba, Atsuki Hiraguchi, Wei-Shu Hou, Karl Jansen, Ying-Jer Kao, C.-J. David Lin, Alberto Ramos, Mugdha Sarkar, [ J. High Energ. Phys. 2025, 214 (2025)](https://doi.org/10.1007/JHEP10(2025)214).
* **Dynamical Quantum Phase Transition and Thermal Equilibrium in the Lattice Thirring Model**,
    Mari Carmen Bañuls, Krzysztof Cichy, Hao-Ti Hung, Ying-Jer Kao, C.-J. David Lin, Amit Singh, [Phys. Rev. Research 7, 023194 (2025)](https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.7.023194).
* **Lattice study of SU(2) gauge theory coupled to four adjoint Higgs fields**,
    Guilherme Catumba, Atsuki Hiraguchi, Wei-Shu Hou, Karl Jansen, Ying-Jer Kao, C.-J. David Lin, Alberto Ramos, Mugdha Sarkar, [Phys. Rev. Research 6, 043172 (2024)](https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.6.043172).
* **Study of SU(2) gauge theories with multiple Higgs fields in different representations**,
    Guilherme Catumba, Atsuki Hiraguchi, George W.-S. Hou, Karl Jansen, Ying-Jer Kao, C.-J. David Lin, Alberto Ramos, Mugdha Sarkar, [arXiv:2210.09855](https://arxiv.org/abs/2210.09855).
* **Phase structure of the CP(1) model in the presence of a topological θ-term**,
    Katsumasa Nakayama, Lena Funcke, Karl Jansen, Ying-Jer Kao, Stefan Kühn, Phys. [Phys. Rev. D 105, 054507 (2022)](https://journals.aps.org/prd/abstract/10.1103/PhysRevD.105.054507).

---

## Machine Learning in Physics

The revolutionary advances in **machine learning (ML) offer a new paradigm for scientific discovery**. In our group, we explore the powerful synergy between ML techniques and the study of complex physical systems. This research operates on two fronts: 1) applying ML to solve physics problems, such as using neural networks to identify complex phases of matter or to perform the Renormalization Group, and 2) using physics-inspired concepts, like tensor networks, to build more powerful and interpretable machine learning models. Our recent work includes developing hybrid quantum-classical algorithms for classification tasks and using reinforcement learning to optimize quantum simulations and systems.

* **Learning phases with Quantum Monte Carlo simulation cell**,
    Amrita Ghosh, Mugdha Sarkar, Ying-Jer Kao, Pochung Chen, [Mach. Learn.: Sci. Technol. 6 045017 (2025)](https://iopscience.iop.org/article/10.1088/2632-2153/ae107c/meta).
* **Variational Quantum Reinforcement Learning via Evolutionary Optimization**,
    Samuel Yen-Chi Chen, Chih-Min Huang, Chia-Wei Hsing, Hsi-Sheng Goan, Ying-Jer Kao, [Mach. Learn.: Sci. Technol. 3 015025(2022)](https://iopscience.iop.org/article/10.1088/2632-2153/ac4559).
* **Neural Monte Carlo Renormalization Group**,
    Jui-Hui Chung, Ying-Jer Kao,[Phys. Rev. Research 3, 023230(2021)](https://doi.org/10.1103/PhysRevResearch.3.023230).
* **An end-to-end trainable hybrid classical-quantum classifier**,
    Samual Yen-Chi Chen, Chih-Min Huang, Chia-Wei Hsing, Ying-Jer Kao, [Mach. Learn.: Sci. Technol. 2 045021 (2021)](https://iopscience.iop.org/article/10.1088/2632-2153/ac104d).
* **Hybrid quantum-classical classifier based on tensor network and variational quantum circuit**,
    Samual Yen-Chi Chen, Chih-Min Huang, Chia-Wei Hsing, Ying-Jer Kao, [arXiv:2011.14651](https://arxiv.org/abs/2011.14651).

---

## Topological and Correlated Systems

This area of research focuses on exotic states of matter whose properties are governed by **quantum entanglement and geometric frustration**. Unlike conventional materials, these systems can host novel phenomena such as **topological phases**, which are robust to local perturbations, and **quantum spin liquids**, where magnetic moments remain disordered even at absolute zero temperature. These materials are at the forefront of condensed matter physics, not only for their fundamental theoretical interest (e.g., hosting fractionalized particles) but also for their potential in applications like fault-tolerant quantum computing. Our work uses advanced numerical simulations to discover and characterize these phases, from novel topological insulators to the intricate magnetic states in frustrated materials like kagome ice.

* **Direct Visualization of Disorder Driven Electronic Liquid Crystal Phases in Dirac Nodal Line Semimetal GdSbTe**,
    Balaji Venkatesan, Syu-You Guan, et al., [npj Quantum Mater. 10, 56 (2025)](https://www.nature.com/articles/s41535-025-00779-y).
* **Chern dartboard insulator: sub-Brillouin zone topology and skyrmion multipoles**,
    Yun-Chung Chen, Yu-Ping Lin, Ying-Jer Kao, [Commun Phys 7, 32 (2024)](https://doi.org/10.1038/s42005-023-01502-8).
* **Stably protected gapless edge states without Wannier obstruction**,
    Yun-Chung Chen, Yu-Ping Lin, Ying-Jer Kao, [Phys. Rev. B 107, 075126 (2023)](https://doi.org/10.1103/PhysRevB.107.075126).
* **Excitation spectrum of spin-1 Kitaev spin liquids**,
    Yu-Hseuh Chen, Jozef Genzor, Yong Baek Kim, Ying-Jer Kao, [Phys. Rev. B 105, L060403(2022)](https://doi.org/10.1103/PhysRevB.105.L060403).
* **Two-wire Junction of Inequivalent Tomonaga-Luttinger Liquids**,
    Yao-Tai Kang, Chung-Yu Lo, Masaki Oshikawa, Ying-Jer Kao, Pochung Chen, [Phys. Rev. B, 104, 235142(2021)](https://link.aps.org/doi/10.1103/PhysRevB.104.235142).
* **Emergent Snake Magnetic Domains in Canted Kagome Ice**,
    Wen-Han Kao, Gia-Wei Chern, Ying-Jer Kao , [Phys. Rev. Res, 2, 023046](https://doi.org/10.1103/PhysRevResearch.2.023046).
* **Entanglement Renyi negativity across a finite temperature transition: a Monte Carlo study**,
    Kai-Hsin Wu, Tsung-Cheng Lu, Chia-Min Chung, Ying-Jer Kao, Tarun Grover, [Phys. Rev. Lett. 125, 140603(2020)](https://doi.org/10.1103/PhysRevLett.125.140603).


# Further Reading

 Our recent publication can be found [here](/publications/). Full list of our publications can be found on [Google Scholar](https://scholar.google.com.tw/citations?user=bO-yL20AAAAJ&hl=en&authuser=2){:target="_blank"} and [arXiv]( http://arxiv.org/a/kao_y_1){:target="_blank"}
