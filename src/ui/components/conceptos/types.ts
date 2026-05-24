export interface ConceptExample {
    label: string;
    note: string;
    path: string;
}

export interface NutritionConcept {
    id: string;
    title: string;
    menuLabel: string;
    icon: string;
    subtitle: string;
    body: string;
    callout: string;
    examplesTitle: string;
    examples: ConceptExample[];
}
