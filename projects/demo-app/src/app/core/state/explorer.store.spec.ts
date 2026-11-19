import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiPage, Character, Episode } from '../models';
import { RICK_AND_MORTY_API_URL } from '../services/rick-and-morty-api.service';
import { ExplorerStore } from './explorer.store';

const API = 'https://api.test';

function page<T>(results: T[]): ApiPage<T> {
  return { info: { count: results.length, pages: 1, next: null, prev: null }, results };
}

const rick: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: '' },
  location: { name: 'Citadel of Ricks', url: '' },
  image: '',
  episode: ['https://rickandmortyapi.com/api/episode/1'],
  url: '',
  created: '2017-11-04T18:48:46.250Z',
};

const pilot: Episode = {
  id: 1,
  name: 'Pilot',
  air_date: 'December 2, 2013',
  episode: 'S01E01',
  characters: [],
  url: '',
  created: '2017-11-10T12:56:33.798Z',
};

describe('ExplorerStore', () => {
  let store: ExplorerStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RICK_AND_MORTY_API_URL, useValue: API },
      ],
    });
    store = TestBed.inject(ExplorerStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga personajes al iniciar y gestiona loading', () => {
    store.load();
    expect(store.loading()).toBe(true);

    http.expectOne(`${API}/character?page=1`).flush(page([rick]));

    expect(store.loading()).toBe(false);
    expect(store.records()).toEqual({ type: 'character', items: [rick] });
  });

  it('aplica el filtro de status como query param', () => {
    store.setStatus('dead');
    http.expectOne(`${API}/character?page=1&status=dead`).flush(page<Character>([]));
    expect(store.status()).toBe('dead');
  });

  it('resetea el filtro al cambiar de recurso', () => {
    store.setStatus('alive');
    http.expectOne(`${API}/character?page=1&status=alive`).flush(page([rick]));

    store.setResource('episode');
    expect(store.status()).toBeNull();
    http.expectOne(`${API}/episode?page=1`).flush(page([pilot]));

    expect(store.records()).toEqual({ type: 'episode', items: [pilot] });
  });

  it('trata el 404 de un filtro sin resultados como lista vacía, no como error', () => {
    store.setStatus('unknown');
    http
      .expectOne(`${API}/character?page=1&status=unknown`)
      .flush({ error: 'There is nothing here' }, { status: 404, statusText: 'Not Found' });

    expect(store.error()).toBeNull();
    expect(store.records().items).toEqual([]);
  });

  it('expone un mensaje de error cuando falla la red', () => {
    store.load();
    http.expectOne(`${API}/character?page=1`).error(new ProgressEvent('error'), { status: 0 });

    expect(store.loading()).toBe(false);
    expect(store.error()).toContain('No pudimos abrir el portal');
  });

  it('cancela la petición anterior si el usuario cambia de recurso rápido', () => {
    store.load();
    const first = http.expectOne(`${API}/character?page=1`);
    store.setResource('episode');

    expect(first.cancelled).toBe(true);
    http.expectOne(`${API}/episode?page=1`).flush(page([pilot]));
    expect(store.records().type).toBe('episode');
  });

  it('elimina un registro del estado local', () => {
    store.load();
    http.expectOne(`${API}/character?page=1`).flush(page([rick]));

    store.removeRecord('character', rick.id);

    expect(store.records().items).toEqual([]);
    expect(store.totalCount()).toBe(0);
  });
});
