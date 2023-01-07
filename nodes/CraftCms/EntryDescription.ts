import { INodeProperties } from 'n8n-workflow';

export const entryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get',
		noDataExpression: true,
		options: [
			// {
			// 	name: 'Create',
			// 	value: 'create',
			// 	action: 'Create an entry',
			// },
			// {
			// 	name: 'Duplicate',
			// 	value: 'duplicate',
			// 	action: 'Duplicate an entry',
			// },
			{
				name: 'Get',
				value: 'get',
				action: 'Get an entry',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many entries',
			},
		],
		displayOptions: {
			show: {
				resource: ['entry'],
			},
		},
	},
];

export const entryFields: INodeProperties[] = [
	// ----------------------------------
	//         entry: create
	// ----------------------------------
	{
		displayName: 'Entry Title',
		name: 'entryTitle',
		type: 'string',
		required: true,
		default: '',
		description: 'The title of the entry to create',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['create'],
			},
		},
	},

	// ----------------------------------
	//       entry: get
	// ----------------------------------
	{
		displayName: 'Entry ID',
		name: 'entryId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the entry to retrieve',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['get'],
			},
		},
	},

	// ----------------------------------
	//       entry: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['getAll'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},

	// ----------------------------------
	//       entry: duplicate
	// ----------------------------------
	{
		displayName: 'Entry Name or ID',
		name: 'entryId',
		type: 'options',
		default: '',
		required: true,
		description:
			'The ID of the entry to duplicate. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getentries',
		},
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['duplicate'],
			},
		},
	},
	{
		displayName: 'New Entry Title',
		name: 'entryName',
		type: 'string',
		required: true,
		default: '',
		description: 'The title of the new entry to create',
		displayOptions: {
			show: {
				resource: ['entry'],
				operation: ['duplicate'],
			},
		},
	},
	// {
	// 	displayName: 'Options',
	// 	name: 'options',
	// 	type: 'collection',
	// 	default: {},
	// 	placeholder: 'Add Field',
	// 	displayOptions: {
	// 		show: {
	// 			operation: ['duplicate'],
	// 			resource: ['entry'],
	// 		},
	// 	},
	// 	options: [
	// 		{
	// 			displayName: 'Copy Contacts',
	// 			name: 'copyContacts',
	// 			type: 'boolean',
	// 			default: false,
	// 			description: 'Whether to copy all the contacts from the original entry',
	// 		},
	// 		{
	// 			displayName: 'Copy Email Provider',
	// 			name: 'copyProvider',
	// 			type: 'boolean',
	// 			default: true,
	// 			description: 'Whether to set the same email provider than the original entry',
	// 		},
	// 		{
	// 			displayName: 'Copy Email Sequence',
	// 			name: 'copyMails',
	// 			type: 'boolean',
	// 			default: true,
	// 			description:
	// 				'Whether to copy all the steps of the email sequence from the original entry',
	// 		},
	// 		{
	// 			displayName: 'Copy Global Settings',
	// 			name: 'copySettings',
	// 			type: 'boolean',
	// 			default: true,
	// 			description: 'Whether to copy all the general settings from the original entry',
	// 		},
	// 	],
	// },
];
