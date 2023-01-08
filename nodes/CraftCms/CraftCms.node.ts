import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	craftCmsApiTest,
	craftCmsGraphqlRequest,
	loadResource,
	getGraphqlQuerySchemaOptions,
	getGraphqlQuerySchemaFields,
} from './GenericFunctions';

import { entryFields, entryOperations } from './EntryDescription';

export class CraftCms implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CraftCms',
		name: 'craftCms',
		icon: 'file:craftcms.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the Craft CMS API',
		defaults: {
			name: 'CraftCms',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'craftCmsApi',
				required: true,
				testedBy: 'craftCmsApiTest',
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Entry',
						value: 'entry',
					},
					// {
					// 	name: 'Asset',
					// 	value: 'assets',
					// },
				],
				default: 'entry',
				required: true,
			},
			...entryFields,
			...entryOperations,
		],
	};

	methods = {
		credentialTest: {
			craftCmsApiTest,
		},

		loadOptions: {
			async getEntries(this: ILoadOptionsFunctions) {
				return loadResource.call(this, 'entry');
			},
			// Get all the queryable entry fields to display them to the user to select them easily
			async getAdditionalFieldParents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const types = await getGraphqlQuerySchemaOptions.call(this);
				return types;
			},
			// Get all fields available to return in said query type
			async getAdditionalFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const interfaceName = this.getCurrentNodeParameter('typeKey') as string;
				const fields = await getGraphqlQuerySchemaFields.call(this, interfaceName);
				return fields;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'entry') {
					// **********************************
					//            entry
					// **********************************

					if (operation === 'get') {
						// ----------------------------------
						//        entry: get
						// ----------------------------------

						const responseData = await craftCmsGraphqlRequest.call(this, {
							query: `
									query entries($id: [QueryArgument]!) {
										entries(id: $id) {
											id
											enabled
											status
											title
										}
									}`,
							variables: {
								id: this.getNodeParameter('entryId', i),
							},
							operationName: 'entries',
						});

						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(responseData.data.entries),
							{ itemData: { item: i } },
						);
						returnData.push(...executionData);
					} else if (operation === 'getAll') {
						// ----------------------------------
						//        campaign: getAll
						// ----------------------------------

						const responseData = await craftCmsGraphqlRequest.call(this, {
							query: `
									query entries {
										entries {
											id
											enabled
											status
											title
											}
										}`,
							operationName: 'entries',
						});

						let entries = responseData.data.entries;

						const returnAll = this.getNodeParameter('returnAll', i);

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i);
							entries = entries.slice(0, limit);
						}

						const executionData = this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray(entries),
							{ itemData: { item: i } },
						);
						returnData.push(...executionData);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}

				throw error;
			}
		}
		return this.prepareOutputData(returnData);
	}
}
