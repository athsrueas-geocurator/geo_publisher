import { afterEach, expect, test } from 'bun:test';
import { GeoApiRequestError, geoGraphqlRequest } from '../src/geo-api-client.ts';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('HTTP 200 GraphQL errors cannot become an empty successful lookup', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({data:{entities:null},errors:[{message:'Unexpected error.'}]}));
  await expect(geoGraphqlRequest('query { entities { id } }')).rejects.toBeInstanceOf(GeoApiRequestError);
});

test('non-OK, invalid JSON, and missing data responses fail with context', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({errors:[{message:'denied'}]}), {status:403,statusText:'Forbidden'});
  await expect(geoGraphqlRequest('query { entity(id:"x") { id } }')).rejects.toMatchObject({status:403, statusText:'Forbidden'});
  globalThis.fetch = async () => new Response('not-json', {status:200,statusText:'OK'});
  await expect(geoGraphqlRequest('query { __typename }')).rejects.toMatchObject({status:200});
  globalThis.fetch = async () => new Response(JSON.stringify({}), {status:200,statusText:'OK'});
  await expect(geoGraphqlRequest('query { __typename }')).rejects.toMatchObject({status:200});
});

for (const name of ['TimeoutError', 'AbortError']) {
  test(`${name} is reported as a request timeout`, async () => {
    globalThis.fetch = async () => { throw new DOMException('Request ended', name); };
    try {
      await geoGraphqlRequest('query { __typename }');
      throw new Error('Expected timeout');
    } catch (error) {
      expect(error).toBeInstanceOf(GeoApiRequestError);
      expect(error.status).toBe(408);
    }
  });
}

test('variables preserve the explicit non-null filter', async () => {
  globalThis.fetch = async (_url, options) => {
    expect(JSON.parse(options.body).variables).toEqual({filter:{name:{isNull:false}}});
    return new Response(JSON.stringify({data:{entities:[{id:'existing'}]}}));
  };
  expect(await geoGraphqlRequest('query($filter: EntityFilter) { entities(filter:$filter) { id } }', {
    variables:{filter:{name:{isNull:false}}},
  })).toEqual({entities:[{id:'existing'}]});
});
