import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-core';

import {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IHookFunctions,
	INodeCredentialTestResult,
	INodePropertyOptions,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

/**
 * Make an authenticated GraphQL request to Craft CMs.
 */
export async function craftCmsGraphqlRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	body: object = {},
) {
	const response = await craftCmsApiRequest.call(this, 'POST', '/graphql', body);

	if (response.errors) {
		throw new NodeApiError(this.getNode(), response);
	}

	return response;
}

/**
 * Make an authenticated POST request to Craft CMS.
 */
export async function craftCmsApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: string,
	endpoint: string,
	body: object = {},
	qs: object = {},
) {
	const { apiKey } = (await this.getCredentials('emeliaApi')) as { apiKey: string };
	const { apiUrl } = (await this.getCredentials('url')) as { apiUrl: string };

	const options = {
		headers: {
			Authorization: apiKey,
		},
		method,
		body,
		qs,
		uri: `${apiUrl}${endpoint}`,
		json: true,
	};

	try {
		return this.helpers.request!.call(this, options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Load resources so that the user can select them easily.
 */
export async function loadResource(
	this: ILoadOptionsFunctions,
	resource: 'entry' | 'asset',
): Promise<INodePropertyOptions[]> {
	const mapping: { [key in 'entry' | 'asset']: { query: string; key: string } } = {
		entry: {
			query: `
				query GetEntries {
					entries {
						id
						title
					}
				}`,
			key: 'entries',
		},
		asset: {
			query: `
			query GetAssets {
				assets {
					id
					title
				}
			}`,
			key: 'assets',
		},
	};

	const responseData = await craftCmsGraphqlRequest.call(this, { query: mapping[resource].query });

	return responseData.data[mapping[resource].key].map(
		(entry: { id: string; title: string }) => ({
			name: entry.title,
			value: entry.id,
		}),
	);
}

export async function craftCmsApiTest(
	this: ICredentialTestFunctions,
	credential: ICredentialsDecrypted,
): Promise<INodeCredentialTestResult> {
	const credentials = credential.data;

	const body = {
		query: `
				query GetEntries {
					entries {
						id
						title
					}
				}`,
		operationName: 'GetEntries',
	};

	const options = {
		headers: {
			Authorization: credentials?.apiKey,
		},
		method: 'POST',
		body,
		uri: `${credentials?.url}/graphql`,
		json: true,
	};

	try {
		await this.helpers.request!(options);
	} catch (error) {
		return {
			status: 'Error',
			message: `Connection details not valid: ${(error as JsonObject).message}`,
		};
	}
	return {
		status: 'OK',
		message: 'Authentication successful!',
	};
}
