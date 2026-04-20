export interface TranslationTargetOption {
  value: string;
  label: string;
}

export const TRANSLATION_TARGET_OPTIONS: TranslationTargetOption[] = [
  { value: 'English', label: 'English' },
  { value: 'Yoruba', label: 'Yoruba' },
  { value: 'Hausa', label: 'Hausa' },
  { value: 'Igbo', label: 'Igbo' },
  { value: 'French', label: 'French' },
  { value: 'Spanish', label: 'Spanish' },
];

export const TRANSLATION_TARGET_PLACEHOLDER = 'Select a target language';
