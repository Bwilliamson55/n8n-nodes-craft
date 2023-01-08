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

import {
	// getFullSchema,
	getSchemaName,
} from './queries'

import {search} from 'jmespath';

/**
 * Get the GraphQL Schema
 */
export async function getGraphqlSchema(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	schemaName: String = '',
) {
	const body = {
		query: getSchemaName,
		variables: {name: schemaName},
		operationName: 'getSchemaName',
	};

	const response = await craftCmsApiRequest.call(this, 'POST', body);
	if (response.errors) {
		throw new NodeApiError(this.getNode(), response);
	}

	return response;
}

/**
 * Get the types of queries available
 */
export async function getGraphqlQuerySchemaOptions(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const schema = await getGraphqlSchema.call(this, 'Query');
	const queryOptions = search(schema, '@.data.__type.fields[?type.kind==`INTERFACE`].{name: name, type: type.name}')
	const returnData: INodePropertyOptions[] = [];
	for (const option of queryOptions) {
		const optionName = option.name;
		const optionId = option.type;
		returnData.push({
			name: optionName,
			value: optionId,
		});
	}
	returnData.sort((a, b) => {
		if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) {
			return -1;
		}
		if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) {
			return 1;
		}
		return 0;
	});
	return returnData;
}

/**
 * Get the types of queries available
 */
export async function getGraphqlQuerySchemaFields(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	querySchemaName: String = 'EntryInterface'
) {
	const schema = await getGraphqlSchema.call(this, querySchemaName);
	const queryOptions = search(schema, '@.data.__type.fields[].name')
	queryOptions.sort();
	const returnData: INodePropertyOptions[] = [];
	for (const option of queryOptions) {
		const optionName = option;
		const optionId = option;
		returnData.push({
			name: optionName,
			value: optionId,
		});
	}
	return returnData;
}

/**
 * Make an authenticated GraphQL request to Craft CMs.
 */
export async function craftCmsGraphqlRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	body: object = {},
) {
	const response = await craftCmsApiRequest.call(this, 'POST', body);

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
	body: object = {},
	qs: object = {},
) {
	const { url, apiEndpoint, apiKey } = (await this.getCredentials('craftCmsApi')) as { url: string; apiEndpoint: string; apiKey: string };

	const options = {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
		method,
		body,
		qs,
		uri: `${url}${apiEndpoint}`,
		json: true,
	};
	try {
		 let response = await this.helpers.request!(options);
		 return response
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
			Authorization: `Bearer ${credentials?.apiKey}`,
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
