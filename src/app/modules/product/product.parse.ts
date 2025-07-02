export function productParse(field: any): string[] {
  // Return empty array if field is null, undefined, or empty string
  if (!field) return [];

  // If field is already an array, return it directly
  if (Array.isArray(field)) return field;

  // If field is a string, try to parse it
  if (typeof field === 'string') {
    // Handle empty string
    if (field.trim() === '') return [];

    try {
   
      const parsed = JSON.parse(field);

     
      if (Array.isArray(parsed)) {
      
        if (parsed.length === 1 && typeof parsed[0] === 'string') {
          try {
            const nestedParsed = JSON.parse(parsed[0]);
            if (Array.isArray(nestedParsed)) {
              return nestedParsed;
            }
          } catch {
            // If nested parsing fails, return the original parsed array
          }
        }
        return parsed;
      }

      // If parsed result is not an array, wrap it in an array
      return [parsed];
    } catch {
      // If JSON parsing fails, split by comma
      return field.includes(',')
        ? field
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '')
        : [field.trim()];
    }
  }

  // If field is not a string or array, convert to string and wrap in array
  return [String(field)];
}