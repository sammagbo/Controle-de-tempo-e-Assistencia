// Returns null if valid, error message string if invalid

export function validateAssignedNames(value: string): string | null {
  if (value.length > 100) return 'Nome não pode ter mais de 100 caracteres.';
  if (/<[^>]+>/.test(value)) return 'Nome não pode conter HTML.';
  return null;
}

export function validateAttendanceCount(value: number): string | null {
  if (!Number.isInteger(value) || value < 0) return 'Assistência deve ser um número inteiro não negativo.';
  if (value > 10000) return 'Número de assistência parece inválido.';
  return null;
}

export function validatePresidentName(value: string): string | null {
  if (value.length > 100) return 'Nome do presidente não pode ter mais de 100 caracteres.';
  if (/<[^>]+>/.test(value)) return 'Nome não pode conter HTML.';
  return null;
}
