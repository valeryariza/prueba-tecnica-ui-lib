import { idFromUrl, idsFromUrls, orDash } from './detail.utils';

describe('detail utils', () => {
  it('extrae el id de una URL de la API', () => {
    expect(idFromUrl('https://rickandmortyapi.com/api/episode/28')).toBe(28);
    expect(idFromUrl('https://rickandmortyapi.com/api/episode/')).toBeNull();
  });

  it('convierte URLs en una lista de ids', () => {
    expect(idsFromUrls(['https://x/api/character/1', 'https://x/api/character/2'])).toBe('#1, #2');
    expect(idsFromUrls([])).toBe('—');
  });

  it('reemplaza strings vacíos por un guion', () => {
    expect(orDash('')).toBe('—');
    expect(orDash('Planet')).toBe('Planet');
  });
});
