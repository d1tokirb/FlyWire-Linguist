// ============================================================================
// Experiment Setup UI: Research Laboratory Initialization Interface
// ============================================================================
// Displays a scientific experiment configuration interface prior to simulation.
// Supports:
// - Mode Selection: Single Fly vs Comparative Lab (4-5 Subjects)
// - Initial Knowledge: Blank, Vocabulary, Grammar, Combined, Scrambled
// - Neural Checkpoint Importing (.json full weight restore)
// - Random Seed, Subject Count, Implant Intensity, Teaching Environment

export class ExperimentSetupUI {
  constructor(onStartExperiment) {
    this.onStartExperiment = onStartExperiment;
    this.modalEl = document.getElementById('experiment-setup-modal');
    this.initEvents();
  }

  show() {
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
    }
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
    }
  }

  initEvents() {
    const btnClose = document.getElementById('btn-close-setup-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.hide());
    }

    const form = document.getElementById('experiment-setup-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const config = this.getFormConfiguration();
        this.hide();
        if (this.onStartExperiment) {
          this.onStartExperiment(config);
        }
      });
    }

    // Mode toggle disables/enables multi-fly controls
    const modeRadios = document.querySelectorAll('input[name="setup-mode"]');
    const multiFlyOptions = document.getElementById('setup-multifly-options');
    const singleFlyOptions = document.getElementById('setup-singlefly-options');

    modeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const isComparative = (e.target.value === 'COMPARATIVE');
        if (multiFlyOptions) multiFlyOptions.style.display = isComparative ? 'block' : 'none';
        if (singleFlyOptions) singleFlyOptions.style.display = isComparative ? 'none' : 'block';
      });
    });

    // Neural Checkpoint File Input
    const fileInput = document.getElementById('setup-checkpoint-file');
    const importStatus = document.getElementById('setup-checkpoint-status');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed && parsed.format === 'flywire-linguist-checkpoint-v1.0') {
              this.importedCheckpoint = parsed;
              if (importStatus) {
                importStatus.textContent = `Checkpoint loaded: ${parsed.metadata?.name || 'Fly'} (${parsed.metadata?.condition || 'State'})`;
                importStatus.style.color = 'var(--c-green)';
              }
            } else {
              throw new Error('Unsupported checkpoint format.');
            }
          } catch (err) {
            if (importStatus) {
              importStatus.textContent = `Error: ${err.message}`;
              importStatus.style.color = 'var(--c-red)';
            }
            this.importedCheckpoint = null;
          }
        };
        reader.readAsText(file);
      });
    }
  }

  getFormConfiguration() {
    const mode = document.querySelector('input[name="setup-mode"]:checked')?.value || 'COMPARATIVE';
    const condition = document.querySelector('input[name="setup-condition"]:checked')?.value || 'COMBINED';
    const intensity = document.getElementById('setup-intensity-select')?.value || 'MEDIUM';
    const environment = document.getElementById('setup-env-select')?.value || 'AUTONOMOUS';
    const seed = parseInt(document.getElementById('setup-seed-input')?.value || '42', 10);
    const includeScrambled = document.getElementById('setup-include-scrambled')?.checked ?? true;

    return {
      mode, // 'SINGLE' or 'COMPARATIVE'
      condition, // For Single Fly
      intensity, // 'LIGHT', 'MEDIUM', 'HEAVY'
      environment, // 'AUTONOMOUS', 'INTERACTIVE', 'MANUAL'
      seed,
      includeScrambled, // 5th subject for Comparative Lab
      importedCheckpoint: this.importedCheckpoint || null
    };
  }
}
