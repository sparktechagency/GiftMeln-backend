export function productParse(field: any): string[] {
    if (!field) return [];

    // Handle already array
    if (Array.isArray(field)) return field;

    try {
        // Case 1: If it's like '["s","m","l"]'
        const parsed = JSON.parse(field);

        // Case 2: If it's like '["[\"s\",\"m\",\"l\"]"]' (nested)
        if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'string') {
            return JSON.parse(parsed[0]);
        }

        return parsed;
    } catch {
        // Fallback: split by comma
        return field.split(',').map((item: string) => item.trim());
    }
}