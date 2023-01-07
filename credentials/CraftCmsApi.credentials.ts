
import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CraftCmsApi implements ICredentialType {
	name = 'craftCmsApi';
	displayName = 'Craft CMS API';
	documentationUrl = 'https://craftcms.com/docs/4.x/graphql.html';
	properties: INodeProperties[] = [
		{
			displayName: 'URL',
			name: 'url',
			type: 'string',
			typeOptions: { password: false },
			default: 'https://your-craft-site.com',
		},
		{
			displayName: 'Endpoint',
			name: 'apiEndpoint',
			type: 'string',
			typeOptions: { password: false },
			default: '/graphql',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '123supersecretkey',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				"Content-Type": 'application/json'
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.url}}',
			url: '={{$credentials?.endpoint}}',
		},
	};
}
