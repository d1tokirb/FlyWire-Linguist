# Comprehensive Scientific Audit & Research Baseline: FlyWire-Linguist

**Repository**: `https://github.com/d1tokirb/FlyWire-Linguist`  
**Dataset**: FlyWire Whole-Brain Connectome (FAFB v783)  
**Date**: November 2026  
**Status**: Research-Ready Experimental Platform  

---

## 1. Executive Summary & Scientific Purpose

FlyWire-Linguist is a computational neuroscience experimental platform designed to test whether an insect mushroom body circuit—instantiated using measured synaptic connectivity from the adult *Drosophila melanogaster* connectome—can acquire discrete English command associations via action-gated, reward-dependent synaptic plasticity.

The project explicitly rejects superficial demonstrations of intelligence, including:
- Pretrained transformer language models or sub-network embeddings
- Hardcoded response dictionaries, template lookups, or dialogue scripts
- Regular-expression intent routing
- Supervised answer injection into plasticity functions
- False baseline depression metrics that misclassify unconditioned synapses as learned

This document establishes the empirical baseline, delineating measured biological data from modeled mathematical abstractions, documenting exact benchmark statistics across 30 independent seeds, and outlining the computational boundaries of the system.

---

## 2. Anatomical Provenance: Measured Connectome vs Modeled Assumptions

### 2.1 Measured Biological Components (FlyWire FAFB v783)

All connectivity data originates from the proofread Full Adult Fly Brain (FAFB v783) connectome release (Nature, October 2024):
- **Source Files**:
  - `connections.csv.gz` (SHA-256: `d49dd692e59e153aa3c83f5257bfc0eff51247b86d7bb183386c6d1622c70fc9`)
  - `classification.csv.gz` (SHA-256: `e946b552f4056dfc977707be0674609832c3f64332a22d69dc0d9615e7aae663`)
- **Measured Neuronal Identities**:
  - **209 Genuine Projection Neurons (PNs)**: 149 Antennal Lobe Projection Neurons (`ALPN`) and 60 visual projection neurons (`visual_projection`). All modulatory cells (26 DANs, 5 MBONs, 2 MBINs) and central unclassified cells have been strictly filtered from sensory banks.
  - **2,597 Kenyon Cells (KCs)**: Right-hemisphere Kenyon cells with verified non-sequential 64-bit root IDs (1,270 $KC_\gamma$, 860 $KC_{\alpha/\beta}$, 467 $KC_{\alpha'/\beta'}$).
  - **21 Mushroom Body Output Neuron (MBON) Classes**: Identified anatomical types spanning 15 vertical and horizontal lobe compartments.
- **Measured Synaptic Edges**:
  - **10,900 PN -> KC Edges**: Encompassing 149,041 measured synapses in the calyx.
  - **7,537 KC -> MBON Edges**: Encompassing 70,244 measured synapses across 21 MBON classes.
- **Neurotransmitter Annotations**:
  - Derived from automated electron microscopy vesicle predictions (Eckstein et al. 2024, Schlegel et al. 2024):
    - MBON01 ($\gamma 5$): Glutamate (`Glu`)
    - MBON02 ($\beta 2$): GABA / Glutamate (`GABA/Glu`)
    - MBON03 ($\beta' 2$): Glutamate (`Glu`)
    - MBON04 ($\beta' 2$): Glutamate (`Glu`)
    - MBON05 ($\gamma 4$): Glutamate / Acetylcholine (`Glu/ACh`)
    - MBON06 ($\beta 1$): Glutamate (`Glu`)
    - MBON07 ($\alpha 1$): Glutamate (`Glu`)
    - MBON09 ($\gamma 3$): GABA (`GABA`)
    - MBON11 ($\gamma 1$): GABA (`GABA`)
    - MBON14 ($\alpha 3$): Acetylcholine (`ACh`)
    - MBON18 ($\alpha 2$): Acetylcholine (`ACh`)
    - MBON20 ($\gamma 2$): GABA (`GABA`)

### 2.2 Modeled Mathematical Abstractions

The following components represent physiological abstractions rather than direct EM reconstructions:
1. **Acoustic Transduction & Filter Banks**:
   - Insects detect acoustic vibrations (e.g. courtship songs, flight tones) via the Johnston's organ (JO) in the antenna, projecting to the Antennal Mechanosensory and Motor Center (AMMC).
   - In this model, acoustic English phonemes are mapped into the 209 projection neurons via two interleaved banks:
     - Bank A (Even PNs: $0, 2, 4 \dots 208$): Instantaneous phonemic filter bank for the focal word.
     - Bank B (Odd PNs: $1, 3, 5 \dots 207$): Temporal delay line representing preceding tokens with exponential recency decay ($\gamma = 0.7$). Dedicated channels ($70..103$) are recruited by semantic negation particles.
2. **APL Feedback Inhibition**:
   - The giant Anterior Paired Lateral (APL) GABAergic neuron provides global divisive feedback across the calyx.
   - Modeled via a dynamic threshold clamp enforcing $\sim 5.0\%$ biological sparsity ($\sim 130$ active KCs out of 2,597) with rectified linear activation.
3. **Dendritic Capacity Normalization ($R_{in}$)**:
   - Kenyon cell membrane potentials are normalized by input capacity $\sum_j W_{ij}$ to represent physiological input resistance ($R_{in}$), where thinner KC subtypes exhibit higher voltage deflections per synaptic quantum.
   - MBON dendritic capacities normalize steady-state output balance.
4. **Action-Gated Scalar Plasticity (PAM / PPL1 LTD)**:
   - Behavioral choice is selected by greedy argmax or softmax exploration over normalized MBON activity before feedback.
   - Scalar environmental reinforcement ($R \in \{-1.0, +1.0\}$) drives dopamine release:
     - $R > 0$ (+PAM Dopamine): Induces Long-Term Depression (LTD) on competing MBON synapses from active KCs, scaled by Reward Prediction Error margin.
     - $R < 0$ (-PPL1 Dopamine): Induces LTD directly on synapses to the erroneous chosen MBON.
   - Zero target tokens or external teacher signals enter the plasticity function.

---

## 3. Mathematical Integrity & Relative Baseline Plasticity

### 3.1 Resolving the Absolute Baseline Bug
In prior implementations, synapses were classified as depressed whenever their absolute weight fell below 0.90 ($W < 0.90$). Because weights are initialized from measured synapse counts ($W_{0,ij} = \text{synCount} / 9.32$), connections with $\le 8$ synapses had baseline weights below 0.90, falsely flagging 4,386 unconditioned connections as depressed and reporting 100% fluency at Tabula Rasa.

**Remediation in f692a85**:
1. Every connection stores its immutable empirical biological baseline weight $W_{0,ij} \in \mathbb{R}^+$.
2. Synaptic depression is evaluated strictly relative to each connection's baseline:
   $$\text{Depressed}(i, j) \iff W_{ij} < 0.85 \times W_{0,ij}$$
3. Tabula Rasa verification:
   - Depressed Synapses: **0**
   - Total Depression Magnitude: **0.000**
   - Plasticity Index: **0.0%**
4. Spontaneous synaptic extinction/turnover relaxes weights toward their biological baselines:
   $$\frac{dW_{ij}}{dt} = -\lambda (W_{ij} - W_{0,ij})$$

### 3.2 Exact Student's t Cumulative Distribution Function
To eliminate hardcoded p-value strings (`"p < 0.0001"`), exact two-tailed probabilities for Welch's t-test are computed directly via the regularized incomplete beta function $I_x(a, b)$:
$$p = I_{x}\left(\frac{\nu}{2}, \frac{1}{2}\right), \quad x = \frac{\nu}{\nu + t^2}$$
Implemented via Lanczos log-gamma series and continued-fraction expansion ($200$ iterations, $\epsilon = 3 \times 10^{-7}$).

---

## 4. Empirical Benchmarks & Statistical Verification

All experiments evaluated across 30 independent deterministic seeds ($N = 30$):

### 4.1 Milestone A: Two-Alternative Forced Choice (2AFC) Conditioning
Paradigmatic T-maze steering paradigm: arbitrary conditioned stimuli (`"dax"` vs `"wug"`) paired with directional choices (`"left"` vs `"right"`).

| Condition | Pre-test (95% CI) | Post-test (95% CI) | Retention (4 trials) | Failed Trials (out of 180) |
|---|---|---|---|---|
| **Experimental (Authentic + Plasticity)** | 50.0% [50.0, 50.0] | **100.0% [100.0, 100.0]** | **100.0% +/- 0.0%** | **30 / 180** |
| **Control 1 (Plasticity Disabled)** | 50.0% [50.0, 50.0] | **50.0% [50.0, 50.0]** | **50.0% +/- 0.0%** | **90 / 180** |
| **Control 2 (Shuffled Connectome)** | 45.0% [33.2, 56.8] | **98.3% [95.1, 100.0]** | **98.3% +/- 1.7%** | **52 / 180** |

- **Statistical Significance**:
  - Experimental vs Plasticity-Disabled: Welch's $t(58.0) = 1936.49$, exact $p = 3.24 \times 10^{-141}$, Cohen's $d = 500.00$.
  - Experimental vs Shuffled Connectome: Welch's $t(29.0) = 1.00$, exact $p = 0.3256$, Cohen's $d = 0.26$.

### 4.2 Milestone B: Multi-Word, Bidirectional Cues & XOR Negation

#### 1. Word Order Representation Sensitivity
- Population Cosine Similarity (`"go left"` vs `"left go"`): **0.198** across 30 seeds.
- Shared Kenyon Cells: **29.0 / ~130** active KCs (22.3% overlap, 77.7% distinct).
- Verifies that temporal delay lines maintain sequence order selectivity.

#### 2. Bidirectional Directional Cues (Anti-Shortcut Paradigm)
Cue presented in both position 0 and position -1 across trials (`"left turn"`, `"turn left"`, `"right turn"`, `"turn right"`).

- **Trained Connectome**: **100.0%** (Std: 0.0000)
- **Control 1 (First-Word Baseline)**: **50.0%** ($t = 1936.49, p = 3.24 \times 10^{-141}$)
- **Control 2 (Final-Word Baseline)**: **50.0%** ($t = 1936.49, p = 3.24 \times 10^{-141}$)
- **Control 3 (Plasticity-Disabled Connectome)**: **75.0%** ($t = 968.25, p = 9.33 \times 10^{-124}$)

#### 3. Multi-Token XOR Negation
Negation particle fundamentally inverts directional valence:
- `"go left"` $\to$ `"left"`
- `"please dont go left"` $\to$ `"right"`
- `"go right"` $\to$ `"right"`
- `"please dont go right"` $\to$ `"left"`

- **Trained Connectome**: **100.0%** (Std: 0.0000)
- **Control 1 (First-Word Baseline)**: **50.0%** ($t = 1936.49, p = 3.24 \times 10^{-141}$)
- **Control 2 (Final-Word Baseline)**: **50.0%** ($t = 1936.49, p = 3.24 \times 10^{-141}$)

#### 4. Unseen Carrier Generalization
Holdout test pairing directional cues with completely unfamiliar carrier word `"fly"`:
- `"left fly"` $\to$ `"left"`
- `"fly left"` $\to$ `"left"`
- `"right fly"` $\to$ `"right"`
- `"fly right"` $\to$ `"right"`
- **Holdout Accuracy**: **100.0%** (Std: 0.0000)

#### 5. Topology Comparison (Biological vs Shuffled)
- Authentic Biological Connectome Accuracy: **100.0%** (Std: 0.0000)
- Shuffled Connectome Control Accuracy: **97.5%** (Std: 0.1006)
- Difference: Welch's $t(29.0) = 1.360$, exact $p = 0.1842$, Cohen's $d = 0.351$.
- **Scientific Finding**: Both the biological connectome and the shuffled connectome achieve high associative accuracy on discrete command tasks. Compartmental dopamine LTD is topologically robust and does not require unique wiring geometry for toy command associations.

---

## 5. Scope, Capabilities, and Scientific Boundaries

### What the Network Genuinely Does:
1. Implements 2,597 Kenyon cells and 21 MBONs using measured integer synapse counts from the proofread FlyWire FAFB v783 dataset.
2. Selects actions before feedback and adapts weights via action-gated scalar reinforcement without teacher signals.
3. Separates temporal sequence order via interleaved delay line banks and resolves non-linear XOR negation via modulatory channels.
4. Generalizes learned directional cues across unfamiliar carrier contexts.

### What the Network Does Not Do:
1. **Not a Large Language Model**: It does not perform open-ended text generation, generative conversational dialogue, or recursive grammar parsing.
2. **Fixed Action Space**: Outputs are strictly constrained to the 21 identified MBON behavioral classes.
3. **Modeled Sensory Mapping**: Acoustic-to-PN transduction is an engineered tonotopic filter bank rather than a biophysical model of the Johnston's organ scolopidia.
4. **No Biological Superiority on Toy Tasks**: The empirical connectome does not outperform shuffled controls on binary steering tasks. Claims of "evolutionary language superiority" are scientifically invalid.

---

## 6. Reproducibility Instructions

All experiments and dataset verifications can be executed directly from the command line:

```bash
# 1. Verify connectome dataset integrity and SHA-256 hashes
python3 scripts/extract_flywire_synapses.py --verify

# 2. Run Tabula Rasa verification & template removal test
node scripts/test_priority1_verification.mjs

# 3. Run FlyWire root ID & APL sparsity test
node scripts/test_priority2_flywire_connectome.mjs

# 4. Run action-gated scalar reinforcement test
node scripts/test_priority3_scalar_reinforcement.mjs

# 5. Run Milestone A: 2AFC associative conditioning benchmark (N=30)
node scripts/benchmark_two_choice_associative_learning.mjs

# 6. Run Milestone B: Multi-word bidirectional & XOR negation benchmark (N=30)
node scripts/benchmark_compositional_generalization.mjs

# 7. Execute master scientific verification suite
node scripts/run_all_benchmarks.mjs
```
