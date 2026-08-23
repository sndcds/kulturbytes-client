// utils/imageAiLabel.ts

import type { ImageAiLabel } from '~/types/image'

export const aiLabelImages: Partial<Record<ImageAiLabel, string>> = {
    ai: '/ai_labels/label_ai_black_transparent.svg',
    ai_generated: '/ai_labels/label_ai_generated_black_transparent.svg',
    ai_modified: '/ai_labels/label_ai_modified_black_transparent.svg',
}